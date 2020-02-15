class Queue {
  constructor() {
    this.queue = [];
  }
  enqueue(element) {
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
}

export default new Queue();
