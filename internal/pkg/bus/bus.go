package bus

import "sync"

// Event represents an event in our system
type Event struct {
	Type    string
	Payload interface{}
}

// EventHandler is an interface for event handlers
type EventHandler interface {
	Handle(event Event)
}

// EventHandlerFunc is a function type that implements EventHandler
type EventHandlerFunc func(event Event)

// Handle calls the function itself
func (f EventHandlerFunc) Handle(event Event) {
	f(event)
}

// EventBus manages the event distribution
type EventBus struct {
	eventChannel chan Event
	handlers     map[string][]EventHandler
	mu           sync.RWMutex
	wg           sync.WaitGroup
}

// NewEventBus creates a new event bus
func NewEventBus() *EventBus {
	bus := &EventBus{
		eventChannel: make(chan Event, 100), // Buffer size of 100 events
		handlers:     make(map[string][]EventHandler),
	}
	go bus.processEvents()
	return bus
}

// Subscribe registers a handler for a specific event type
func (bus *EventBus) Subscribe(eventType string, handler EventHandler) {
	bus.mu.Lock()
	defer bus.mu.Unlock()
	bus.handlers[eventType] = append(bus.handlers[eventType], handler)
}

// SubscribeFunc registers a function as a handler for a specific event type
func (bus *EventBus) SubscribeFunc(eventType string, handlerFunc func(event Event)) {
	bus.Subscribe(eventType, EventHandlerFunc(handlerFunc))
}

// Publish sends an event to the event bus
func (bus *EventBus) Publish(event Event) {
	bus.wg.Add(1)
	bus.eventChannel <- event
}

// processEvents processes events from the event channel
func (bus *EventBus) processEvents() {
	for event := range bus.eventChannel {
		func(ev Event) {
			defer bus.wg.Done()

			bus.mu.RLock()
			handlers, exists := bus.handlers[ev.Type]
			// Copy slice to avoid holding lock during execution
			var handlersCopy []EventHandler
			if exists {
				handlersCopy = make([]EventHandler, len(handlers))
				copy(handlersCopy, handlers)
			}
			bus.mu.RUnlock()

			if exists {
				for _, handler := range handlersCopy {
					handler.Handle(ev)
				}
			}
		}(event)
	}
}

// Wait waits for all published events to be processed
func (bus *EventBus) Wait() {
	bus.wg.Wait()
}

// Close shuts down the event bus
func (bus *EventBus) Close() {
	close(bus.eventChannel)
}
