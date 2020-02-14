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

    //connection
    this._mongoose = mongoose;
    this._mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    //create Log model
    this._models = {
      Log: this._mongoose.model("Log", {
        useragent: {
          isMobile: Boolean,
          isTablet: Boolean,
          isDesktop: Boolean,
          isBot: Boolean,
          browser: String,
          version: String,
          os: String,
          platform: String
        },
        query: String,
        state: Boolean,
        date: Date
      })
    };
  }

  get mongoose() {
    return this._mongoose;
  }

  get models() {
    return this._models;
  }
}

const database = new MongoDB();

export const mongoDB = {
  connection: database.mongoose,
  models: database.models
};
