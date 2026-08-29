// File: internal/pkg/docker/client.go
package docker

import (
	"context"
	"fmt"
	"io"
	"os"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
)

type Client struct {
	cli *client.Client
}

func NewClient() (*Client, error) {
	dockerHost := os.Getenv("DOCKER_HOST")
	if dockerHost == "" {
		dockerHost = "unix:///var/run/docker.sock"
	}

	cli, err := client.NewClientWithOpts(
		client.WithHost(dockerHost),
		client.WithAPIVersionNegotiation(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create docker client: %w", err)
	}

	return &Client{cli: cli}, nil
}

type ContainerConfig struct {
	Name          string
	ImageName     string
	ImageTag      string
	Hostname      string
	CPULimit      float64 // e.g. 1.0 = 1 core
	MemoryLimitMB int
	VolumePath    string
	PortMappings  map[int]int // containerPort -> hostPort
}

// PullImage pulls an image if not present locally.
func (c *Client) PullImage(ctx context.Context, imageName, tag string) error {
	fullImage := fmt.Sprintf("%s:%s", imageName, tag)
	reader, err := c.cli.ImagePull(ctx, fullImage, image.PullOptions{})
	if err != nil {
		return fmt.Errorf("image pull error: %w", err)
	}
	defer reader.Close()
	_, _ = io.Copy(io.Discard, reader)
	return nil
}

// CreateAndStartContainer provisions and starts a hardened Docker container.
func (c *Client) CreateAndStartContainer(ctx context.Context, cfg ContainerConfig) (string, error) {
	fullImage := fmt.Sprintf("%s:%s", cfg.ImageName, cfg.ImageTag)

	exposedPorts := nat.PortSet{}
	portBindings := nat.PortMap{}
	for cPort, hPort := range cfg.PortMappings {
		portKey := nat.Port(fmt.Sprintf("%d/tcp", cPort))
		exposedPorts[portKey] = struct{}{}
		portBindings[portKey] = []nat.PortBinding{
			{
				HostIP:   "0.0.0.0",
				HostPort: fmt.Sprintf("%d", hPort),
			},
		}
	}

	cpuQuota := int64(cfg.CPULimit * 100000)
	memBytes := int64(cfg.MemoryLimitMB) * 1024 * 1024

	var binds []string
	if cfg.VolumePath != "" {
		binds = append(binds, fmt.Sprintf("%s:/home:rw", cfg.VolumePath))
	}

	containerConfig := &container.Config{
		Image:        fullImage,
		Hostname:     cfg.Hostname,
		ExposedPorts: exposedPorts,
		Tty:          true,
		OpenStdin:    true,
		AttachStdin:  true,
		AttachStdout: true,
		AttachStderr: true,
	}

	hostConfig := &container.HostConfig{
		PortBindings: portBindings,
		Binds:        binds,
		Resources: container.Resources{
			CPUPeriod:  100000,
			CPUQuota:   cpuQuota,
			Memory:     memBytes,
			MemorySwap: memBytes, // No swap
			PidsLimit:  func(i int64) *int64 { return &i }(256),
		},
		CapDrop: []string{"ALL"},
		CapAdd:  []string{"CHOWN", "SETUID", "SETGID", "NET_BIND_SERVICE", "DAC_OVERRIDE", "FOWNER"},
		SecurityOpt: []string{
			"no-new-privileges:true",
		},
		RestartPolicy: container.RestartPolicy{
			Name: "unless-stopped",
		},
		LogConfig: container.LogConfig{
			Type: "json-file",
			Config: map[string]string{
				"max-size": "10m",
				"max-file": "3",
			},
		},
	}

	resp, err := c.cli.ContainerCreate(ctx, containerConfig, hostConfig, nil, nil, cfg.Name)
	if err != nil {
		return "", fmt.Errorf("failed to create container: %w", err)
	}

	if err := c.cli.ContainerStart(ctx, resp.ID, container.StartOptions{}); err != nil {
		return resp.ID, fmt.Errorf("failed to start container: %w", err)
	}

	return resp.ID, nil
}

// StartContainer starts an existing stopped container.
func (c *Client) StartContainer(ctx context.Context, dockerID string) error {
	return c.cli.ContainerStart(ctx, dockerID, container.StartOptions{})
}

// StopContainer stops a running container.
func (c *Client) StopContainer(ctx context.Context, dockerID string) error {
	timeout := 10
	return c.cli.ContainerStop(ctx, dockerID, container.StopOptions{Timeout: &timeout})
}

// RestartContainer restarts a running container.
func (c *Client) RestartContainer(ctx context.Context, dockerID string) error {
	timeout := 10
	return c.cli.ContainerRestart(ctx, dockerID, container.StopOptions{Timeout: &timeout})
}

// KillContainer sends SIGKILL to a container.
func (c *Client) KillContainer(ctx context.Context, dockerID string) error {
	return c.cli.ContainerKill(ctx, dockerID, "SIGKILL")
}

// RemoveContainer removes a container instance.
func (c *Client) RemoveContainer(ctx context.Context, dockerID string) error {
	return c.cli.ContainerRemove(ctx, dockerID, container.RemoveOptions{
		Force: true,
	})
}

// ExecCreate creates an exec instance inside the container.
func (c *Client) ExecCreate(ctx context.Context, dockerID string, cmd []string) (string, error) {
	resp, err := c.cli.ContainerExecCreate(ctx, dockerID, container.ExecOptions{
		AttachStdin:  true,
		AttachStdout: true,
		AttachStderr: true,
		Tty:          true,
		Cmd:          cmd,
	})
	if err != nil {
		return "", err
	}
	return resp.ID, nil
}

// ExecAttach attaches to a running exec instance.
func (c *Client) ExecAttach(ctx context.Context, execID string) (types.HijackedResponse, error) {
	return c.cli.ContainerExecAttach(ctx, execID, container.ExecAttachOptions{
		Tty: true,
	})
}

// ExecResize resizes the terminal tty of an exec session.
func (c *Client) ExecResize(ctx context.Context, execID string, height, width uint) error {
	return c.cli.ContainerExecResize(ctx, execID, container.ResizeOptions{
		Height: height,
		Width:  width,
	})
}
