import express from "express";
import bodyParser from "body-parser";
import router from "./router";
import useragent from "express-useragent";

class Server {
  constructor() {
    this._express = express();
    this.middleware();
  }

  middleware() {
    //bodyParser 사용설정
    this._express.use(bodyParser.json()); //json 포맷의 데이터를 사용
    this._express.use(bodyParser.urlencoded({ extended: true })); //인코딩 된 데이터 사용
    //useragent parser
    this._express.use(useragent.express());
    //router 설정
    this._express.use(router);
  }

  get express() {
    return this._express;
  }
}

export default new Server().express;
