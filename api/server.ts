import express = require('express');
import bodyParser = require('body-parser');
import useragent = require('express-useragent');
import router from './router';
import Sequelize from './database/sequelize';
import Mongoose from './database/mongoose';

class Server {
  private static _instance: Server;
  private _app!: express.Application;
  private _sequelize!: Sequelize;
  private _mongoose!: Mongoose;

  constructor() {
    try {
      if (!Server._instance) {
        this._app = express();
        this.initDatabase();
        this.initMiddleware();
        Server._instance = this;
      }
      return Server._instance;
    } catch (err) {
      console.error('Server init failed.', err);
    }
  }

  initDatabase() {
    this._sequelize = new Sequelize();
    this._mongoose = new Mongoose();
  }

  initMiddleware() {
    // //bodyParser 사용설정
    this.app.use(bodyParser.json()); //json 포맷의 데이터를 사용
    this.app.use(bodyParser.urlencoded({ extended: true })); //인코딩 된 데이터 사용

    //useragent parser
    this._app.use(useragent.express());

    //router 설정
    this._app.use(router);
  }

  get app(): express.Application {
    return this._app;
  }
}

const server = new Server();

export default server.app;
