package errs

import "errors"

var (
	ErrUserNotFound     = errors.New("pengguna tidak ditemukan")
	ErrEmailAlreadyUsed = errors.New("email sudah terdaftar")
	ErrInvalidPassword  = errors.New("kata sandi salah")
	ErrUsernameTaken    = errors.New("username sudah dipakai")
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
