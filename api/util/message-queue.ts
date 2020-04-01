import redis = require('redis');
import config from '../config';

class MessageQueue extends redis.RedisClient {
  constructor() {
    const options = config.db.redis.messageQueue;
    super(options);
  }

  public async enqueue(key: string, message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.rpush(key, message, err => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  public async dequeueAll(key: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.lrange(key, 0, -1, (err, messages) => {
        if (err) {
          reject(err);
        }
        const parsedMessages = messages.map(message => JSON.parse(message));
        this.del(key, err => {
          if (err) {
            reject(err);
          }
          resolve(parsedMessages);
        });
      });
    });
  }

  public size(key: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.llen(key, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }
}

export default new MessageQueue();
