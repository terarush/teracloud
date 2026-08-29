// File: modules/billing/domain/service/reminder_service.go
package service

import (
	"fmt"
	"html/template"
	"os"

	"ruang-tukar/internal/pkg/mailer"
)

type ReminderService struct {
	mailer *mailer.Mailer
}

func NewReminderService() *ReminderService {
	port := 587
	m := mailer.New(mailer.Config{
		Host:     os.Getenv("SMTP_HOST"),
		Port:     port,
		Username: os.Getenv("SMTP_USERNAME"),
		Password: os.Getenv("SMTP_PASSWORD"),
	})
	return &ReminderService{mailer: m}
}

func (s *ReminderService) SendPaymentSuccessEmail(email, name, planName string, amount int64) error {
	body := fmt.Sprintf("Halo %s,<br><br>Pembayaran untuk paket <b>%s</b> sebesar <b>Rp%d</b> telah berhasil diverifikasi.<br>Container Anda sedang disiapkan dan akan segera aktif.", name, planName, amount)
	html, _ := mailer.RenderTemplate(mailer.EmailData{
		AppName:     "Teracloud",
		Title:       "Pembayaran Berhasil",
		Body:        template.HTML(body),
		ActionURL:   os.Getenv("APP_FRONTEND_URL") + "/dashboard",
		ActionLabel: "Buka Dashboard",
	})
	return s.mailer.Send(email, "Pembayaran Berhasil — Teracloud", html)
}

func (s *ReminderService) SendContainerReadyEmail(email, name, containerName, imageName, host string, portSummary string) error {
	body := fmt.Sprintf("Halo %s,<br><br>Container <b>%s</b> (%s) Anda sudah aktif dan siap digunakan!<br><br><b>Akses Port:</b><br>%s", name, containerName, imageName, portSummary)
	html, _ := mailer.RenderTemplate(mailer.EmailData{
		AppName:     "Teracloud",
		Title:       "Container Anda Telah Siap!",
		Body:        template.HTML(body),
		ActionURL:   os.Getenv("APP_FRONTEND_URL") + "/dashboard/containers",
		ActionLabel: "Lihat Container",
	})
	return s.mailer.Send(email, fmt.Sprintf("Container %s Siap Digunakan — Teracloud", containerName), html)
}

func (s *ReminderService) SendExpirationReminder(email, name string, daysLeft int, planName string) error {
	body := fmt.Sprintf("Halo %s,<br><br>Langganan Anda untuk paket <b>%s</b> akan berakhir dalam <b>%d hari</b>.<br>Silakan lakukan perpanjangan agar container tetap aktif tanpa gangguan.", name, planName, daysLeft)
	html, _ := mailer.RenderTemplate(mailer.EmailData{
		AppName:     "Teracloud",
		Title:       fmt.Sprintf("Pengingat Langganan: %d Hari Tersisa", daysLeft),
		Body:        template.HTML(body),
		ActionURL:   os.Getenv("APP_FRONTEND_URL") + "/dashboard/billing",
		ActionLabel: "Perpanjang Sekarang",
	})
	return s.mailer.Send(email, fmt.Sprintf("Pengingat: Langganan Berakhir dalam %d Hari — Teracloud", daysLeft), html)
}

func (s *ReminderService) SendSuspendedNotice(email, name, containerName string) error {
	body := fmt.Sprintf("Halo %s,<br><br>Masa tenggang (grace period) langganan Anda telah berakhir. Container <b>%s</b> telah dihentikan (suspended).<br>Data Anda akan disimpan selama 7 hari sebelum dihapus permanen.", name, containerName)
	html, _ := mailer.RenderTemplate(mailer.EmailData{
		AppName:     "Teracloud",
		Title:       "Container Dihentikan (Suspended)",
		Body:        template.HTML(body),
		ActionURL:   os.Getenv("APP_FRONTEND_URL") + "/dashboard/billing",
		ActionLabel: "Aktifkan Kembali",
	})
	return s.mailer.Send(email, "Pemberitahuan: Container Dihentikan — Teracloud", html)
}
