// File: internal/pkg/scheduler/scheduler.go
package scheduler

import (
	"sync"
	"time"

	"teracloud/internal/pkg/logger"
)

// Job represents a scheduled background job.
type Job struct {
	Name     string
	Interval time.Duration
	Fn       func() error
	ticker   *time.Ticker
	stop     chan struct{}
}

// Scheduler manages background recurring jobs.
type Scheduler struct {
	jobs    []*Job
	logger  *logger.Logger
	mu      sync.Mutex
	running bool
}

// New creates a new Scheduler.
func New(log *logger.Logger) *Scheduler {
	return &Scheduler{
		logger: log,
	}
}

// Every registers a recurring job.
func (s *Scheduler) Every(interval time.Duration, name string, fn func() error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.jobs = append(s.jobs, &Job{
		Name:     name,
		Interval: interval,
		Fn:       fn,
		stop:     make(chan struct{}),
	})
}

// Start begins all registered jobs.
func (s *Scheduler) Start() {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.running {
		return
	}
	s.running = true
	for _, job := range s.jobs {
		go s.runJob(job)
	}
	s.logger.Info("Scheduler started with %d jobs", len(s.jobs))
}

func (s *Scheduler) runJob(job *Job) {
	job.ticker = time.NewTicker(job.Interval)
	defer job.ticker.Stop()

	s.logger.Info("Scheduler job '%s' started (every %s)", job.Name, job.Interval)

	for {
		select {
		case <-job.ticker.C:
			s.logger.Debug("Scheduler running job: %s", job.Name)
			if err := job.Fn(); err != nil {
				s.logger.Error("Scheduler job '%s' failed: %v", job.Name, err)
			}
		case <-job.stop:
			s.logger.Info("Scheduler job '%s' stopped", job.Name)
			return
		}
	}
}

// Stop gracefully stops all jobs.
func (s *Scheduler) Stop() {
	s.mu.Lock()
	defer s.mu.Unlock()
	if !s.running {
		return
	}
	for _, job := range s.jobs {
		close(job.stop)
	}
	s.running = false
	s.logger.Info("Scheduler stopped")
}
