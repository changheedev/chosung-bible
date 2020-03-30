export default class Queue<T> {
  private queue!: T[];

  constructor() {
    this.queue = [];
  }

  enqueue(element: T) {
    this.queue.push(element);
  }

  dequeue() {
    return this.queue.shift();
  }

  dequeueAll() {
    return this.queue.splice(0);
  }

  isEmpty() {
    if (this.queue.length === 0) return true;
    return false;
  }

  isFull() {
    if (this.queue.length === 10) return true;
    return false;
  }
}
