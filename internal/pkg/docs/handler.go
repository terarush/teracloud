package docs

import (
	"net/http"

	"teracloud/internal/pkg/config"

	"github.com/labstack/echo/v5"
	"github.com/swaggo/swag"
)

func RegisterRoutes(e *echo.Echo) {
	// Block docs in production
	if config.GetBool("APP_PRODUCTION") {
		return
	}

	e.GET("/api/docs/doc.json", func(c *echo.Context) error {
		doc, err := swag.ReadDoc()
		if err != nil {
			return c.String(http.StatusInternalServerError, "failed to read swagger doc")
		}
		return c.Blob(http.StatusOK, "application/json", []byte(doc))
	})

	e.GET("/api/docs/*", func(c *echo.Context) error {
		path := c.Param("*")
		if path == "" || path == "/" {
			return c.HTML(http.StatusOK, swaggerPage())
		}
		return c.Redirect(http.StatusMovedPermanently, "/api/docs/")
	})
}

func swaggerPage() string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>API Documentation</title>
</head>
<body>
  <script id="api-reference" data-url="/api/docs/doc.json" data-theme="moon"></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.25.83"></script>
</body>
</html>`
}
