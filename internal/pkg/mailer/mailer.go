package mailer

import (
	"crypto/tls"
	"embed"
	"fmt"
	"html/template"
	"net/smtp"
	"os"
	"strings"
)

//go:embed template.html
var emailFS embed.FS

var emailTmpl *template.Template

func init() {
	emailTmpl = template.Must(template.ParseFS(emailFS, "template.html"))
}

type Config struct {
	Host     string
	Port     int
	Username string
	Password string
	From     string
}

type Mailer struct {
	cfg Config
}

func New(cfg Config) *Mailer {
	if cfg.From == "" {
		name := os.Getenv("APP_NAME")
		name = strings.ReplaceAll(name, "-", " ")
		if len(name) > 0 {
			name = strings.ToUpper(name[:1]) + name[1:]
		}
		cfg.From = fmt.Sprintf("%s <%s>", name, cfg.Username)
	}
	return &Mailer{cfg: cfg}
}

// fromAddress extracts the bare email from a formatted "Name <email>" string.
func fromAddress(from string) string {
	if idx := strings.Index(from, "<"); idx >= 0 {
		from = from[idx+1 : strings.LastIndex(from, ">")]
	}
	return from
}

func (m *Mailer) Send(to, subject, body string) error {
	addr := fmt.Sprintf("%s:%d", m.cfg.Host, m.cfg.Port)

	headers := map[string]string{
		"From":         m.cfg.From,
		"To":           to,
		"Subject":      subject,
		"MIME-Version": "1.0",
		"Content-Type": "text/html; charset=UTF-8",
	}
	var msg strings.Builder
	for k, v := range headers {
		fmt.Fprintf(&msg, "%s: %s\r\n", k, v)
	}
	msg.WriteString("\r\n")
	msg.WriteString(body)

	// bare email for SMTP envelope (MAIL FROM)
	envFrom := fromAddress(m.cfg.From)

	if m.cfg.Port == 465 {
		tlsCfg := &tls.Config{ServerName: m.cfg.Host}
		conn, err := tls.Dial("tcp", addr, tlsCfg)
		if err != nil {
			return fmt.Errorf("tls dial: %w", err)
		}
		client, err := smtp.NewClient(conn, m.cfg.Host)
		if err != nil {
			return fmt.Errorf("smtp client: %w", err)
		}
		defer client.Close()

		auth := smtp.PlainAuth("", m.cfg.Username, m.cfg.Password, m.cfg.Host)
		if err = client.Auth(auth); err != nil {
			return fmt.Errorf("auth: %w", err)
		}
		if err = client.Mail(envFrom); err != nil {
			return fmt.Errorf("mail from: %w", err)
		}
		if err = client.Rcpt(to); err != nil {
			return fmt.Errorf("rcpt: %w", err)
		}
		w, err := client.Data()
		if err != nil {
			return fmt.Errorf("data: %w", err)
		}
		w.Write([]byte(msg.String()))
		w.Close()
		return client.Quit()
	}

	return smtp.SendMail(addr, smtp.PlainAuth("", m.cfg.Username, m.cfg.Password, m.cfg.Host), envFrom, []string{to}, []byte(msg.String()))
}

type EmailData struct {
	AppName     string
	Domain      string
	Title       string
	Body        template.HTML
	ActionURL   string
	ActionLabel string
	Extra       string
}

func RenderTemplate(data EmailData) (string, error) {
	if data.Domain == "" {
		fe := os.Getenv("APP_FRONTEND_URL")
		if fe != "" {
			data.Domain = strings.TrimPrefix(fe, "https://")
		}
	}
	var buf strings.Builder
	err := emailTmpl.Execute(&buf, data)
	return buf.String(), err
}
