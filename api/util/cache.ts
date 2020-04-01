import redis = require('redis');
import config from '../config';

class RedisCache extends redis.RedisClient {
  constructor() {
    const options = config.db.redis.cache;
    super(options);
  }

  public async setAsync(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.set(key, JSON.stringify(value), err => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  public async getAsync(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(key, (err, result) => {
        if (err) reject(err);
        resolve(JSON.parse(result));
      });
    });
  }
}

export default new RedisCache();
