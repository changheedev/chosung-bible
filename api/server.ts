import express = require('express');
import bodyParser = require('body-parser');
import useragent = require('express-useragent');
import router from './router';

class Server {
  private _app!: express.Application;
  constructor() {
    try {
      this._app = express();
      this.middleware();
    } catch (err) {
      console.error('Server init failed.', err);
    }
  }

  middleware() {
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

const server: Server = new Server();

export default server.app;
