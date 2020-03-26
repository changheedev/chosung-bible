import { connect, connection, Connection } from 'mongoose';
import config from '../../config';

export default class MongooseDatabase {
  private static instance: MongooseDatabase;
  private connection!: Connection;
  constructor() {
    if (!MongooseDatabase.instance) {
      const connectUrl = config.db.mongoose.url;

      //connection
      connect(connectUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      this.connection = connection;
      this.connection.on('error', console.error.bind(console, 'Mongodb connection error:'));
      this.connection.once('open', function() {
        // we're connected!
        console.log('=======================================================');
        console.log('Mongodb connection successful');
        console.log('=======================================================');
      });
      MongooseDatabase.instance = this;
    }
    return MongooseDatabase.instance;
  }

  disconnect(): Promise<void> {
    return this.connection.close();
  }
}
