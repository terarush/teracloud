package jwt

import (
	"fmt"
	"time"

	gojwt "github.com/golang-jwt/jwt"
)

type JWT interface {
	GenerateToken(data map[string]interface{}) (string, error)
	ValidateToken(token string) (bool, error)
	ParseToken(tokenString string) (map[string]interface{}, error)
}

type JWTImpl struct {
	SignatureKey string
	Expiration   int
}

func NewJWTImpl(signatureKey string, expiration int) JWT {
	return &JWTImpl{SignatureKey: signatureKey, Expiration: expiration}
}

func (j *JWTImpl) GenerateToken(data map[string]interface{}) (string, error) {
	var mySigningKey = []byte(j.SignatureKey)
	token := gojwt.New(gojwt.SigningMethodHS256)
	claims := token.Claims.(gojwt.MapClaims)

	for key, value := range data {
		claims[key] = value
	}

	claims["exp"] = time.Now().Add(time.Duration(j.Expiration) * 24 * time.Hour).Unix()

	tokenString, err := token.SignedString(mySigningKey)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func (j *JWTImpl) ValidateToken(tokenString string) (bool, error) {
	token, err := gojwt.Parse(tokenString, func(token *gojwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*gojwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(j.SignatureKey), nil
	})
	if err != nil {
		return false, err
	}

	claims, ok := token.Claims.(gojwt.MapClaims)
	if !ok || !token.Valid {
		return false, nil
	}

	exp, ok := claims["exp"].(float64)
	if !ok || time.Now().Unix() > int64(exp) {
		return false, nil
	}

	return true, nil
}

func (j *JWTImpl) ParseToken(tokenString string) (map[string]interface{}, error) {
	token, err := gojwt.Parse(tokenString, func(token *gojwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*gojwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(j.SignatureKey), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(gojwt.MapClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}
