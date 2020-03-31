import redis = require('redis');
import config from '../config';
import { promisify } from 'util';

class RedisCache extends redis.RedisClient {
  constructor() {
    const options = config.db.redis;
    super(options);
  }

  public async getAsync(key: string): Promise<string> {
    try {
      const promiseGet = promisify(this.get).bind(this);
      return await promiseGet(key);
    } catch (err) {
      console.error('Redis 캐시에서 데이터를 가져오는 과정에서 오류가 발생했습니다\n', err);
      return '';
    }
  }
}

export default new RedisCache();
