// Define a type for events and their corresponding data types
export type EventMap = Record<string, unknown>;

// Type for callbacks that handle event data
type EventCallback<T> = (data: T) => void;

export class EventEmitter<Events extends EventMap = EventMap> {
  // Use unknown instead of any - it's more type-safe
  private events = new Map<keyof Events, EventCallback<unknown>[]>();

  public on<K extends keyof Events>(
    event: K,
    callback: EventCallback<Events[K]>
  ): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    // Type assertion is needed here, but it's safer than using any
    this.events.get(event)?.push(callback as EventCallback<unknown>);
  }

  public emit<K extends keyof Events>(event: K, data?: Events[K]): void {
    const callbacks = this.events.get(event);
    if (!callbacks) return;
    // Each callback is called with the appropriate data
    callbacks.forEach((callback) => {
      // This cast is necessary but type-safe given our implementation
      (callback as EventCallback<Events[K]>)(data as Events[K]);
    });
  }

  public off<K extends keyof Events>(
    event: K,
    callback?: EventCallback<Events[K]>
  ): void {
    if (!callback) {
      this.events.delete(event);
      return;
    }

    const callbacks = this.events.get(event);
    if (!callbacks) return;

    // Find the callback in the array
    const index = callbacks.indexOf(callback as EventCallback<unknown>);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }
}
