// File: modules/containers/errs/errors.go
package errs

import "ruang-tukar/internal/pkg/utils"

const (
	CodeContainerNotFound         = "CONTAINER_NOT_FOUND"
	CodeContainerNotRunning       = "CONTAINER_NOT_RUNNING"
	CodeContainerAlreadyRunning   = "CONTAINER_ALREADY_RUNNING"
	CodeContainerSuspended        = "CONTAINER_SUSPENDED"
	CodeContainerActionNotAllowed = "CONTAINER_ACTION_NOT_ALLOWED"
	CodeMaxSessionsReached        = "MAX_SESSIONS_REACHED"
)

var (
	ErrContainerNotFound         = utils.NewAppError(CodeContainerNotFound, "Container not found")
	ErrContainerNotRunning       = utils.NewAppError(CodeContainerNotRunning, "Container is not running. Start the container first.")
	ErrContainerAlreadyRunning   = utils.NewAppError(CodeContainerAlreadyRunning, "Container is already running.")
	ErrContainerSuspended        = utils.NewAppError(CodeContainerSuspended, "Container is suspended due to unpaid bill.")
	ErrContainerActionNotAllowed = utils.NewAppError(CodeContainerActionNotAllowed, "This action is not allowed for the container's current state.")
	ErrMaxSessionsReached        = utils.NewAppError(CodeMaxSessionsReached, "Maximum concurrent terminal sessions reached for this container.")
)
