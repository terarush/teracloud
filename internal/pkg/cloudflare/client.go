package cloudflare

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type TunnelRoute struct {
	Subdomain string `json:"subdomain"`
	HostPort  int    `json:"host_port"`
	Name      string `json:"name"`
	URL       string `json:"url,omitempty"`
}

type Client struct {
	apiToken  string
	accountID string
	zoneID    string
	tunnelID  string
	domain    string
}

func NewClient() *Client {
	apiToken := os.Getenv("CLOUDFLARE_API_TOKEN")
	accountID := os.Getenv("CLOUDFLARE_ACCOUNT_ID")
	zoneID := os.Getenv("CLOUDFLARE_ZONE_ID")
	tunnelID := os.Getenv("CLOUDFLARE_TUNNEL_ID")
	domain := os.Getenv("TUNNEL_DOMAIN")

	if apiToken == "" || accountID == "" || zoneID == "" || tunnelID == "" || domain == "" {
		return nil
	}

	return &Client{
		apiToken:  apiToken,
		accountID: accountID,
		zoneID:    zoneID,
		tunnelID:  tunnelID,
		domain:    domain,
	}
}

func (c *Client) IsEnabled() bool {
	return c != nil
}

type cloudflareResponse struct {
	Success bool            `json:"success"`
	Errors  []interface{}   `json:"errors"`
	Result  json.RawMessage `json:"result"`
}

type tunnelConfig struct {
	Config struct {
		Ingress []map[string]interface{} `json:"ingress"`
	} `json:"config"`
}

func (c *Client) getTunnelConfig(ctx context.Context) (*tunnelConfig, error) {
	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/accounts/%s/cfd_tunnel/%s/configurations", c.accountID, c.tunnelID)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+c.apiToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to get tunnel config: status %d, body: %s", resp.StatusCode, string(body))
	}

	var cfResp cloudflareResponse
	if err := json.NewDecoder(resp.Body).Decode(&cfResp); err != nil {
		return nil, err
	}

	var config tunnelConfig
	if err := json.Unmarshal(cfResp.Result, &config); err != nil {
		return nil, err
	}

	return &config, nil
}

func (c *Client) updateTunnelConfig(ctx context.Context, config *tunnelConfig) error {
	// Ensure catch-all is at the end
	var newIngress []map[string]interface{}
	var catchAll map[string]interface{}

	for _, rule := range config.Config.Ingress {
		service, ok := rule["service"].(string)
		if ok && service == "http_status:404" {
			catchAll = rule
		} else {
			newIngress = append(newIngress, rule)
		}
	}

	if catchAll == nil {
		catchAll = map[string]interface{}{"service": "http_status:404"}
	}
	newIngress = append(newIngress, catchAll)
	config.Config.Ingress = newIngress

	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/accounts/%s/cfd_tunnel/%s/configurations", c.accountID, c.tunnelID)
	bodyBytes, err := json.Marshal(config)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.apiToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to update tunnel config: status %d, body: %s", resp.StatusCode, string(respBody))
	}

	return nil
}

type dnsRecord struct {
	Type    string `json:"type"`
	Name    string `json:"name"`
	Content string `json:"content"`
	Proxied bool   `json:"proxied"`
	ID      string `json:"id,omitempty"`
}

func (c *Client) createDNSRecord(ctx context.Context, subdomain string) error {
	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%s/dns_records", c.zoneID)
	hostname := fmt.Sprintf("%s.%s", subdomain, c.domain)
	target := fmt.Sprintf("%s.cfargotunnel.com", c.tunnelID)

	record := dnsRecord{
		Type:    "CNAME",
		Name:    hostname,
		Content: target,
		Proxied: true,
	}

	bodyBytes, err := json.Marshal(record)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.apiToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		// Ignore if already exists (usually code 81053 in errors array, simple check here)
		var cfResp cloudflareResponse
		if json.Unmarshal(respBody, &cfResp) == nil {
			for _, e := range cfResp.Errors {
				if errMap, ok := e.(map[string]interface{}); ok {
					if code, ok := errMap["code"].(float64); ok && code == 81053 {
						return nil // Already exists
					}
				}
			}
		}
		return fmt.Errorf("failed to create DNS record: status %d, body: %s", resp.StatusCode, string(respBody))
	}

	return nil
}

func (c *Client) deleteDNSRecord(ctx context.Context, subdomain string) error {
	hostname := fmt.Sprintf("%s.%s", subdomain, c.domain)
	
	// 1. Get DNS record ID
	listURL := fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%s/dns_records?name=%s&type=CNAME", c.zoneID, hostname)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, listURL, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.apiToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	
	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		return fmt.Errorf("failed to list DNS records: status %d", resp.StatusCode)
	}

	var listResp cloudflareResponse
	if err := json.NewDecoder(resp.Body).Decode(&listResp); err != nil {
		resp.Body.Close()
		return err
	}
	resp.Body.Close()

	var records []dnsRecord
	if err := json.Unmarshal(listResp.Result, &records); err != nil {
		return err
	}

	if len(records) == 0 {
		return nil // Not found, nothing to delete
	}

	// 2. Delete DNS record
	recordID := records[0].ID
	delURL := fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%s/dns_records/%s", c.zoneID, recordID)
	delReq, err := http.NewRequestWithContext(ctx, http.MethodDelete, delURL, nil)
	if err != nil {
		return err
	}
	delReq.Header.Set("Authorization", "Bearer "+c.apiToken)
	delReq.Header.Set("Content-Type", "application/json")

	delResp, err := http.DefaultClient.Do(delReq)
	if err != nil {
		return err
	}
	defer delResp.Body.Close()

	if delResp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(delResp.Body)
		return fmt.Errorf("failed to delete DNS record: status %d, body: %s", delResp.StatusCode, string(body))
	}

	return nil
}


func (c *Client) AddRoutes(ctx context.Context, routes []TunnelRoute) error {
	if !c.IsEnabled() || len(routes) == 0 {
		return nil
	}

	config, err := c.getTunnelConfig(ctx)
	if err != nil {
		return err
	}

	for _, route := range routes {
		hostname := fmt.Sprintf("%s.%s", route.Subdomain, c.domain)
		service := fmt.Sprintf("http://localhost:%d", route.HostPort)
		
		// Check if already exists
		exists := false
		for _, rule := range config.Config.Ingress {
			if h, ok := rule["hostname"].(string); ok && h == hostname {
				exists = true
				break
			}
		}
		
		if !exists {
			config.Config.Ingress = append(config.Config.Ingress, map[string]interface{}{
				"hostname": hostname,
				"service":  service,
			})
		}
	}

	if err := c.updateTunnelConfig(ctx, config); err != nil {
		return err
	}

	for _, route := range routes {
		if err := c.createDNSRecord(ctx, route.Subdomain); err != nil {
			// Log error but continue
			fmt.Fprintf(os.Stderr, "Error creating DNS record for %s: %v\n", route.Subdomain, err)
		}
	}

	return nil
}

func (c *Client) RemoveRoutes(ctx context.Context, subdomains []string) error {
	if !c.IsEnabled() || len(subdomains) == 0 {
		return nil
	}

	config, err := c.getTunnelConfig(ctx)
	if err != nil {
		return err
	}

	hostnamesToRemove := make(map[string]bool)
	for _, sub := range subdomains {
		hostnamesToRemove[fmt.Sprintf("%s.%s", sub, c.domain)] = true
	}

	var newIngress []map[string]interface{}
	for _, rule := range config.Config.Ingress {
		if h, ok := rule["hostname"].(string); ok {
			if hostnamesToRemove[h] {
				continue // Skip removing this route
			}
		}
		newIngress = append(newIngress, rule)
	}
	config.Config.Ingress = newIngress

	if err := c.updateTunnelConfig(ctx, config); err != nil {
		return err
	}

	for _, sub := range subdomains {
		if err := c.deleteDNSRecord(ctx, sub); err != nil {
			fmt.Fprintf(os.Stderr, "Error deleting DNS record for %s: %v\n", sub, err)
		}
	}

	return nil
}
