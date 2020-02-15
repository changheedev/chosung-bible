import mongoose from "mongoose";
import fs from "fs";
import path from "path";

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
    this._models = Object.assign(
      {},
      ...fs.readdirSync(path.join(__dirname, "/models")).map(file => {
        const model = require(path.join(path.join(__dirname, "/models"), file))
          .default;

        return {
          [model.name]: model.init(this._mongoose)
        };
      })
    );
  }

  get mongoose() {
    return this._mongoose;
  }

  get models() {
    return this._models;
  }
}

const database = new MongoDB();

export default {
  connection: database.mongoose,
  models: database.models
};
