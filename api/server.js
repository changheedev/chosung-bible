import express from "express";
import bodyParser from "body-parser";
import router from "./router";
import useragent from "express-useragent";

class Server {
  constructor() {
    try {
      this._app = express();
      this.middleware();
    } catch (err) {
      console.error("Server init failed.", err);
    }
  }

  middleware() {
    //bodyParser 사용설정
    this._app.use(bodyParser.json()); //json 포맷의 데이터를 사용
    this._app.use(bodyParser.urlencoded({ extended: true })); //인코딩 된 데이터 사용

    //useragent parser
    this._app.use(useragent.express());

    //router 설정
    this._app.use(router);
  }

  get app() {
    return this._app;
  }
}

const server = new Server();

export default server.app;
