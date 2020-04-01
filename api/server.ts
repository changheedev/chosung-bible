import sequelize, { Sequelize } from './database/sequelize';
import mongoose, { Mongoose } from './database/mongoose';
import schedule = require('node-schedule');
import { application, Express } from './app';

class Server {
  private _app!: Express;
  private _sequelize!: Sequelize;
  private _mongoose!: Mongoose;
  private exceptionOccured = false;

  constructor() {}

  async start() {
    try {
      this.initApp();
      await this.initDatabase();
      this.setExitEventHandler();
    } catch (err) {
      console.log('서버를 실행하는 과정에서 오류가 발생했습니다', err);
      this.stop();
    }
  }

  private initApp() {
    this._app = application.init();
  }

  private async initDatabase() {
    this._sequelize = sequelize.init();
    await this._sequelize.authenticate();
    console.log('Maria 데이터베이스가 연결되었습니다');

    this._mongoose = await mongoose.init();
    console.log('Mongo 데이터베이스가 연결되었습니다');
  }

  private setExitEventHandler() {
    process.on('uncaughtException', err => {
      this.exceptionOccured = true;
      server.stop();
    });

    process.on('SIGINT', () => {
      server.stop();
    });

    process.on('exit', code => {
      if (this.exceptionOccured) console.log('Exception occured');
      else console.log('Kill signal received');
      console.log(`exit code : ${code}`);
    });
  }

  private cancelJobs() {
    const jobList = schedule.scheduledJobs;
    for (const jobName in jobList) {
      schedule.cancelJob(jobName);
    }
  }

  async stop() {
    try {
      this.cancelJobs();
      if (this._sequelize) {
        await this._sequelize.close();
      }
      if (this._mongoose) {
        await this._mongoose.disconnect();
      }
    } catch (err) {
      console.error('서버를 종료하는 과정에서 오류가 발생했습니다', err);
    } finally {
      process.exit(0);
    }
  }

  get app() {
    return this._app;
  }
}

const server = new Server();
server.start();

export default server.app;
