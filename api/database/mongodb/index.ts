import mongoose = require('mongoose');

class MongoDB {
  private static _instance: MongoDB;
  private _mongoose!: mongoose.Mongoose;

  private constructor() {
    if (!process.env.MONGO_URI) throw new Error('Not exist MongoDB config');

    if (!MongoDB._instance) {
      //connection
      this._mongoose = mongoose;

      this._mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      const db: mongoose.Connection = mongoose.connection;
      db.on('error', console.error.bind(console, 'Mongodb connection error:'));
      db.once('open', function() {
        // we're connected!
        console.log('=======================================================');
        console.log('Mongodb connection successful');
        console.log('=======================================================');
      });

      MongoDB._instance = this;
    }
    return MongoDB._instance;
  }

  static getInstance() {
    return new MongoDB();
  }

  get mongoose() {
    return this._mongoose;
  }
}

const database = MongoDB.getInstance();

export default database.mongoose;
