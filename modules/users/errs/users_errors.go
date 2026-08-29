package errs

import "errors"

var (
	ErrUserNotFound     = errors.New("pengguna tidak ditemukan")
	ErrEmailAlreadyUsed = errors.New("email sudah terdaftar")
)

var FieldLabels = map[string]string{
	"Name":            "Nama",
	"FirstName":       "Nama Depan",
	"LastName":        "Nama Belakang",
	"Username":        "Username",
	"Email":           "Email",
	"Password":        "Kata Sandi",
	"ConfirmPassword": "Konfirmasi Kata Sandi",
}
