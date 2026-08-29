// File: modules/billing/dto/response/billing_response.go
package response

import (
	"time"

	"ruang-tukar/modules/billing/domain/entity"
)

type SubscriptionResponse struct {
	ID             uint       `json:"id"`
	UserID         uint       `json:"user_id"`
	PlanID         uint       `json:"plan_id"`
	ContainerID    *uint      `json:"container_id,omitempty"`
	Status         string     `json:"status"`
	PeriodStart    time.Time  `json:"period_start"`
	PeriodEnd      time.Time  `json:"period_end"`
	GracePeriodEnd *time.Time `json:"grace_period_end,omitempty"`
	AutoRenew      bool       `json:"auto_renew"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

func FromSubscriptionEntity(s *entity.Subscription) *SubscriptionResponse {
	return &SubscriptionResponse{
		ID:             s.ID,
		UserID:         s.UserID,
		PlanID:         s.PlanID,
		ContainerID:    s.ContainerID,
		Status:         s.Status,
		PeriodStart:    s.PeriodStart,
		PeriodEnd:      s.PeriodEnd,
		GracePeriodEnd: s.GracePeriodEnd,
		AutoRenew:      s.AutoRenew,
		CreatedAt:      s.CreatedAt,
		UpdatedAt:      s.UpdatedAt,
	}
}

func FromSubscriptionEntities(subs []*entity.Subscription) []*SubscriptionResponse {
	res := make([]*SubscriptionResponse, len(subs))
	for i, s := range subs {
		res[i] = FromSubscriptionEntity(s)
	}
	return res
}
