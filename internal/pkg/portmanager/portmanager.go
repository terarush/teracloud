// File: internal/pkg/portmanager/portmanager.go
package portmanager

import (
	"fmt"
	"net"
	"sync"

	"teracloud/internal/pkg/database"

	"gorm.io/gorm"
)

// PortAllocation represents a port allocation in the database.
type PortAllocation struct {
	ID            uint   `gorm:"primaryKey" json:"id"`
	ContainerID   uint   `gorm:"column:container_id" json:"container_id"`
	HostPort      int    `gorm:"column:host_port;uniqueIndex" json:"host_port"`
	ContainerPort int    `gorm:"column:container_port" json:"container_port"`
	Protocol      string `gorm:"column:protocol;type:varchar(5);default:tcp" json:"protocol"`
	Description   string `gorm:"column:description;type:varchar(100)" json:"description"`
}

func (PortAllocation) TableName() string {
	return database.HT("port_allocations")
}

// Manager handles port allocation and release.
type Manager struct {
	rangeStart int
	rangeEnd   int
	mu         sync.Mutex
}

// New creates a new port Manager.
func New(rangeStart, rangeEnd int) *Manager {
	return &Manager{
		rangeStart: rangeStart,
		rangeEnd:   rangeEnd,
	}
}

// Allocate finds and reserves an available port for a container.
func (m *Manager) Allocate(db *gorm.DB, containerID uint, containerPort int, description string) (int, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	// Get all allocated ports
	var allocated []int
	if err := db.Model(&PortAllocation{}).Pluck("host_port", &allocated).Error; err != nil {
		return 0, fmt.Errorf("failed to query allocated ports: %w", err)
	}

	allocatedSet := make(map[int]bool, len(allocated))
	for _, p := range allocated {
		allocatedSet[p] = true
	}

	// Find first available port in range
	for port := m.rangeStart; port <= m.rangeEnd; port++ {
		if allocatedSet[port] {
			continue
		}
		// Check if port is actually free on the host
		if !isPortFree(port) {
			continue
		}

		alloc := PortAllocation{
			ContainerID:   containerID,
			HostPort:      port,
			ContainerPort: containerPort,
			Protocol:      "tcp",
			Description:   description,
		}
		if err := db.Create(&alloc).Error; err != nil {
			continue // race condition — try next port
		}
		return port, nil
	}

	return 0, fmt.Errorf("no available ports in range %d-%d", m.rangeStart, m.rangeEnd)
}

// Release frees all ports allocated to a container.
func (m *Manager) Release(db *gorm.DB, containerID uint) error {
	return db.Where("container_id = ?", containerID).Delete(&PortAllocation{}).Error
}

// isPortFree checks if a TCP port is available on the host.
func isPortFree(port int) bool {
	ln, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		return false
	}
	ln.Close()
	return true
}
