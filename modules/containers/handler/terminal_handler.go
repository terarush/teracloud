// File: modules/containers/handler/terminal_handler.go
package handler

import (
	"encoding/json"
	"strconv"
	"sync"
	"time"

	"ruang-tukar/internal/pkg/config"
	"ruang-tukar/internal/pkg/docker"
	"ruang-tukar/internal/pkg/logger"
	"ruang-tukar/internal/pkg/ws"
	"ruang-tukar/modules/containers/domain/service"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v5"
)

type TerminalHandler struct {
	containerService *service.ContainerService
	dockerClient     *docker.Client
	log              *logger.Logger
	sessions         sync.Map // containerID -> int (active session count)
}

func NewTerminalHandler(
	log *logger.Logger,
	containerService *service.ContainerService,
	dockerClient *docker.Client,
) *TerminalHandler {
	return &TerminalHandler{
		containerService: containerService,
		dockerClient:     dockerClient,
		log:              log,
	}
}

type ControlMessage struct {
	Type string `json:"type"` // "resize", "ping"
	Cols uint   `json:"cols"`
	Rows uint   `json:"rows"`
}

// HandleTerminal executes a live WebSocket shell inside the container.
func (h *TerminalHandler) HandleTerminal(c *echo.Context) error {
	ctx := c.Request().Context()

	// 1. Auth via query parameter token
	token := c.QueryParam("token")
	if token == "" {
		return c.String(401, "Missing token")
	}

	jwtService := config.GetJWTService()
	claims, err := jwtService.ParseToken(token)
	if err != nil {
		return c.String(401, "Invalid token")
	}

	var userID uint
	if id, ok := claims["user_id"].(float64); ok {
		userID = uint(id)
	}
	userRole, _ := claims["role"].(string)

	// 2. Validate Container
	containerIDVal, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.String(400, "Invalid container ID")
	}
	containerID := uint(containerIDVal)

	containerRecord, err := h.containerService.GetContainerByID(ctx, containerID)
	if err != nil {
		return c.String(404, "Container not found")
	}

	if userRole != "admin" && containerRecord.UserID != userID {
		return c.String(403, "Access denied")
	}

	if containerRecord.Status != "running" {
		return c.String(400, "Container is not running")
	}

	// 3. Upgrade HTTP to WebSocket
	conn, err := ws.Upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		h.log.Error("WebSocket upgrade failed: %v", err)
		return err
	}
	defer conn.Close()

	// 4. Create Docker Exec
	execID, err := h.dockerClient.ExecCreate(ctx, containerRecord.DockerContainerID, []string{"/bin/bash"})
	if err != nil {
		// Fallback to /bin/sh
		execID, err = h.dockerClient.ExecCreate(ctx, containerRecord.DockerContainerID, []string{"/bin/sh"})
		if err != nil {
			_ = conn.WriteJSON(map[string]string{"type": "error", "message": "Failed to create exec session"})
			return nil
		}
	}

	// 5. Attach to Exec
	hijackResp, err := h.dockerClient.ExecAttach(ctx, execID)
	if err != nil {
		_ = conn.WriteJSON(map[string]string{"type": "error", "message": "Failed to attach exec session"})
		return nil
	}
	defer hijackResp.Close()

	// Connected notification
	_ = conn.WriteJSON(map[string]string{
		"type":           "connected",
		"container_name": containerRecord.ContainerName,
	})

	errChan := make(chan error, 2)

	// Read from Docker stdout/stderr -> WebSocket write (binary)
	go func() {
		buf := make([]byte, 4096)
		for {
			n, err := hijackResp.Reader.Read(buf)
			if n > 0 {
				if wErr := conn.WriteMessage(websocket.BinaryMessage, buf[:n]); wErr != nil {
					errChan <- wErr
					return
				}
			}
			if err != nil {
				errChan <- err
				return
			}
		}
	}()

	// Read from WebSocket -> Docker stdin or control message
	go func() {
		for {
			msgType, data, err := conn.ReadMessage()
			if err != nil {
				errChan <- err
				return
			}

			if msgType == websocket.BinaryMessage {
				if _, wErr := hijackResp.Conn.Write(data); wErr != nil {
					errChan <- wErr
					return
				}
			} else if msgType == websocket.TextMessage {
				var ctrl ControlMessage
				if err := json.Unmarshal(data, &ctrl); err == nil {
					switch ctrl.Type {
					case "resize":
						if ctrl.Rows > 0 && ctrl.Cols > 0 {
							_ = h.dockerClient.ExecResize(ctx, execID, ctrl.Rows, ctrl.Cols)
						}
					case "ping":
						_ = conn.WriteJSON(map[string]string{"type": "pong"})
					}
				} else {
					// Raw text input also routed to stdin
					_, _ = hijackResp.Conn.Write(data)
				}
			}
		}
	}()

	// Wait until disconnect or error
	select {
	case <-errChan:
	case <-time.After(30 * time.Minute): // 30m idle limit
	}

	return nil
}

func (h *TerminalHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	e.GET(basePath+"/ws/containers/:id/terminal", h.HandleTerminal)
}
