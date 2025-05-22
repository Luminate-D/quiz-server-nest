type Listener<T extends any[]> = (...args: T) => void;

export class EventEmitter<EventMap extends Record<string, any[]>> {
  private listeners: { [K in keyof EventMap]?: Listener<EventMap[K]>[] } = {};

  on<K extends keyof EventMap>(
    event: K,
    listener: Listener<EventMap[K]>,
  ): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  off<K extends keyof EventMap>(
    event: K,
    listener: Listener<EventMap[K]>,
  ): void {
    const arr = this.listeners[event];
    if (!arr) return;
    this.listeners[event] = arr.filter((l) => l !== listener);
  }

  removeAllListeners<K extends keyof EventMap>(event: K): void {
    this.listeners[event] = [];
  }

  emit<K extends keyof EventMap>(event: K, ...args: EventMap[K]): void {
    const arr = this.listeners[event];
    if (!arr) return;
    for (const listener of arr) {
      listener(...args);
    }
  }
}
