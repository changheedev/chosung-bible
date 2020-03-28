import express = require('express');
import bodyParser = require('body-parser');
import useragent = require('express-useragent');
import router from './router';
import { requestErrorHandler } from './error-handler';

class Application {
  private app!: express.Express;

  constructor() {}

  init() {
    if (!this.app) {
      this.app = express();
      this.setMiddleware();
      this.setRouter();
      this.setErrorHandler();
    }
    return this.app;
  }

  private setMiddleware() {
    //bodyParser 사용설정
    this.app.use(bodyParser.json()); //json 포맷의 데이터를 사용
    this.app.use(bodyParser.urlencoded({ extended: true })); //인코딩 된 데이터 사용

    //useragent parser
    this.app.use(useragent.express());
  }

  private setRouter() {
    //router 설정
    this.app.use(router);
  }

  private setErrorHandler() {
    //error handling
    this.app.use(requestErrorHandler);
  }
}

export const application = new Application();
export type Express = express.Express;
