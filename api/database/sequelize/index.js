import Sequelize from "sequelize";
import fs from "fs";
import path from "path";

class Database {
  constructor() {
    //connect db
    this._sequelize = new Sequelize(
      process.env.DB_DATABASE,
      process.env.DB_USERNAME,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "mariadb",
        dialectOptions: {
          ssl: false,
          charset: "utf8",
          collate: "utf8_general_ci",
          timezone: "Asia/Seoul"
        },
        define: {
          timestamps: false
        }
      }
    );

    // Load each model file
    const models = Object.assign(
      {},
      ...fs.readdirSync(path.join(__dirname, "/models")).map(file => {
        const model = require(path.join(path.join(__dirname, "/models"), file))
          .default;

        return {
          [model.name]: model.init(this._sequelize)
        };
      })
    );

    this._models = models;

    //db con test
    this._sequelize
      .authenticate()
      .then(() => {
        console.log("==============================================");
        console.log("Connection has been established successfully.");
        console.log("==============================================");
      })
      .catch(err => {
        console.log("==============================================");
        console.log("Unable to connect to the database:");
        console.log("==============================================");
      });
  }

  get sequelize() {
    return this._sequelize;
  }

  get models() {
    return this._models;
  }
}

const database = new Database();

export const models = database.models;
export const sequelize = database.sequelize;
