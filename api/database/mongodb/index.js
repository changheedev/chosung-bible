import mongoose from "mongoose";

class MongoDB {
  constructor() {
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "Mongodb connection error:"));
    db.once("open", function() {
      // we're connected!
      console.log("=======================================================");
      console.log("Mongodb connection has been established successfully.");
      console.log("=======================================================");
    });

    this._mongoose = mongoose;
    this._mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }

  get mongoose() {
    return this._mongoose;
  }
}

const mongoDB = new MongoDB();

export const connection = mongoDB.mongoose;
