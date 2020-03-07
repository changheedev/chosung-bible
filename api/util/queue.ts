class Queue {
  private static _instance: Queue;
  private queue!: any[];

  private constructor() {
    if (!Queue._instance) {
      this.queue = [];
      Queue._instance = this;
    }
    return Queue._instance;
  }

  enqueue(element: any) {
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

  static getInstance() {
    return new Queue();
  }
}

export default Queue.getInstance();
