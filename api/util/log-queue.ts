import SearchLog from '../database/mongoose/models/SearchLog';
import Queue from './queue';
import UserAgent from '../models/UserAgent';
import { Details } from 'express-useragent';

class LogQueue {
  private static _instance: LogQueue;
  private _timer!: any;
  private constructor() {
    if (!LogQueue._instance) {
      LogQueue._instance = this;
      this._timer = this.startTimer();
    }
    return LogQueue._instance;
  }

  startTimer(): NodeJS.Timeout {
    if (!process.env.LOG_INTERVAL) throw new Error('Not exist log timer config');

    //큐에 쌓인 로그를 주기적으로 db에 저장
    const timer = setInterval(() => {
      if (Queue.isEmpty()) return;
      SearchLog.insertMany(Queue.dequeueAll(), err => {
        if (err) {
          console.error('Insert log failed.', err);
          return;
        }
        console.log('insert log...');
      });
    }, Number(process.env.LOG_INTERVAL));

    return timer;
  }

  stopTimer() {
    clearInterval(this._timer);
    this._timer = null;
  }

  insertLog(ua: Details | undefined, query: Object) {
    const userAgent = new UserAgent(ua);

    Queue.enqueue({
      useragent: userAgent.toObject(),
      query: query,
      date: Date.now()
    });
  }

  static getInstance() {
    return new LogQueue();
  }
}

export default LogQueue.getInstance();
