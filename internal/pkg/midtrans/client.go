// File: internal/pkg/midtrans/client.go
package midtrans

import (
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"os"

	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"
)

type Client struct {
	serverKey    string
	clientKey    string
	isProduction bool
	snapClient   snap.Client
}

func NewClient() *Client {
	serverKey := os.Getenv("MIDTRANS_SERVER_KEY")
	clientKey := os.Getenv("MIDTRANS_CLIENT_KEY")
	isProd := os.Getenv("MIDTRANS_PRODUCTION") == "true"

	env := midtrans.Sandbox
	if isProd {
		env = midtrans.Production
	}

	var snapClient snap.Client
	snapClient.New(serverKey, env)

	return &Client{
		serverKey:    serverKey,
		clientKey:    clientKey,
		isProduction: isProd,
		snapClient:   snapClient,
	}
}

type SnapRequest struct {
	OrderID     string
	GrossAmount int64
	FirstName   string
	LastName    string
	Email       string
	ItemName    string
}

type SnapResponse struct {
	Token       string `json:"token"`
	RedirectURL string `json:"redirect_url"`
}

// CreateTransaction generates a Snap token and redirect URL for payment.
func (c *Client) CreateTransaction(req SnapRequest) (*SnapResponse, error) {
	snapReq := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  req.OrderID,
			GrossAmt: req.GrossAmount,
		},
		CustomerDetail: &midtrans.CustomerDetails{
			FName: req.FirstName,
			LName: req.LastName,
			Email: req.Email,
		},
		Items: &[]midtrans.ItemDetails{
			{
				ID:    req.OrderID,
				Name:  req.ItemName,
				Price: req.GrossAmount,
				Qty:   1,
			},
		},
	}

	resp, err := c.snapClient.CreateTransaction(snapReq)
	if err != nil {
		return nil, fmt.Errorf("midtrans snap error: %w", err)
	}

	return &SnapResponse{
		Token:       resp.Token,
		RedirectURL: resp.RedirectURL,
	}, nil
}

// VerifySignature validates that a webhook notification genuinely came from Midtrans.
// Signature formula: SHA512(order_id + status_code + gross_amount + ServerKey)
func (c *Client) VerifySignature(orderID, statusCode, grossAmount, signatureKey string) bool {
	raw := orderID + statusCode + grossAmount + c.serverKey
	hash := sha512.Sum512([]byte(raw))
	expected := hex.EncodeToString(hash[:])
	return expected == signatureKey
}
