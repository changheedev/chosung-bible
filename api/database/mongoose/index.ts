import { connect, Mongoose } from 'mongoose';
import config from '../../config';

export { Mongoose };

class MongooseDatabase {
  private client!: Mongoose;
  constructor() {}

  async init(): Promise<Mongoose> {
    if (!this.client) {
      const options = config.db.mongoose;
      this.client = await connect(options.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
    return this.client;
  }

  async close() {
    await this.client.disconnect();
  }
}

export default new MongooseDatabase();
