// Package storage provides a MinIO/S3-compatible object storage client.
//
// It is initialized from environment variables and is a no-op (Client is nil)
// when MINIO_ENDPOINT is not set, so the application still boots without
// object storage configured.
package storage

import (
	"context"
	"fmt"
	"io"
	"os"
	"strings"

	"teracloud/internal/pkg/logger"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// Client is the initialized MinIO client, or nil when storage is not configured.
var Client *minio.Client

// Bucket is the name of the bucket files are uploaded to.
var Bucket string

// Init reads MinIO configuration from the environment and prepares the bucket.
// If MINIO_ENDPOINT is unset, it logs a warning and leaves Client nil.
// If set, it connects, auto-creates the bucket if missing, and applies a
// public-read policy so uploaded files can be served directly by MinIO.
func Init(log *logger.Logger) error {
	endpoint := os.Getenv("MINIO_ENDPOINT")
	if endpoint == "" {
		if log != nil {
			log.Warn("MINIO_ENDPOINT not set — object storage disabled")
		}
		return nil
	}

	accessKey := os.Getenv("MINIO_ACCESS_KEY_ID")
	secretKey := os.Getenv("MINIO_SECRET_ACCESS_KEY")
	useSSL := os.Getenv("MINIO_USE_SSL") == "true"
	bucket := os.Getenv("MINIO_BUCKET")
	if bucket == "" {
		panic("MINIO_BUCKET must be set when MINIO_ENDPOINT is set")
	}

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return err
	}

	ctx := context.Background()
	exists, err := client.BucketExists(ctx, bucket)
	if err != nil {
		return err
	}
	if !exists {
		if err := client.MakeBucket(ctx, bucket, minio.MakeBucketOptions{}); err != nil {
			return err
		}
		if log != nil {
			log.Info("Created storage bucket: %s", bucket)
		}
	}

	// Public-read policy so objects can be served straight from MinIO.
	policy := `{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::` + bucket + `/*"]}]}`
	if err := client.SetBucketPolicy(ctx, bucket, policy); err != nil {
		return err
	}

	Client = client
	Bucket = bucket
	if log != nil {
		log.Info("Object storage initialized at %s (bucket %s)", endpoint, bucket)
	}
	return nil
}

// FolderFromPath derives the object-storage key prefix from a request path,
// e.g. "/api/v1/plans/upload" → "plans/", "/api/v1/auth/upload" → "auth/".
// An extra segment after "upload" or query param becomes a subfolder.
func FolderFromPath(path string) string {
	clean := strings.Trim(path, "/")
	segments := strings.Split(clean, "/")

	for i, seg := range segments {
		if seg == "api" || strings.HasPrefix(seg, "v") {
			continue
		}
		if seg == "upload" || seg == "uploads" {
			if i+1 < len(segments) && segments[i+1] != "" {
				return segments[i+1] + "/"
			}
			if i > 0 {
				return segments[i-1] + "/"
			}
		} else {
			// If module segment comes before upload
			if i+1 < len(segments) && (segments[i+1] == "upload" || segments[i+1] == "uploads") {
				if i+2 < len(segments) && segments[i+2] != "" {
					return seg + "/" + segments[i+2] + "/"
				}
				return seg + "/"
			}
		}
	}

	if len(segments) > 0 {
		first := segments[0]
		if first == "api" && len(segments) > 2 {
			return segments[2] + "/"
		}
		return first + "/"
	}

	return "uploads/"
}

// BaseURL returns the public base URL files are served from, e.g.
// "http://192.168.200.150:9000/teracloud". Empty when storage is disabled.
func BaseURL() string {
	if Client == nil {
		return ""
	}
	endpoint := os.Getenv("MINIO_ENDPOINT")
	useSSL := os.Getenv("MINIO_USE_SSL") == "true"
	scheme := "http"
	if useSSL {
		scheme = "https"
	}
	return scheme + "://" + endpoint + "/" + Bucket
}

// UploadObject uploads an io.Reader stream to MinIO object storage.
// Returns the full public URL of the uploaded object.
func UploadObject(ctx context.Context, objectName string, reader io.Reader, size int64, contentType string) (string, error) {
	if Client == nil {
		return "", minio.ErrorResponse{Code: "StorageDisabled", Message: "Object storage is not configured"}
	}

	_, err := Client.PutObject(ctx, Bucket, objectName, reader, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%s/%s", BaseURL(), strings.TrimPrefix(objectName, "/")), nil
}


