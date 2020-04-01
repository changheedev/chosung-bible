import nodeSchedule = require('node-schedule');
import UserAgentUtil from './user-agent';
import { Details } from 'express-useragent';
import { SearchLogModel } from '../database/mongoose/models/SearchLog';
import mq from './message-queue';
import config from '../config';

class SearchLogQueue {
  private scheduler!: nodeSchedule.Job;
  private key = 'search-log';

  constructor() {
    this.scheduler = nodeSchedule.scheduleJob(this.key, config.log.cronRule, () => {
      this.saveLogsToDatabase();
    });
  }

  async insertLog(userAgentDetail: Details | undefined, query: Object, type: 'db' | 'cache') {
    try {
      const userAgent = UserAgentUtil.parseUserAgent(userAgentDetail);
      const newLog = {
        userAgent: userAgent,
        query: query,
        type: type,
        date: Date.now()
      };
      await mq.enqueue(this.key, JSON.stringify(newLog));
      const len = await mq.size(this.key);
      if (len === 10) {
        this.saveLogsToDatabase();
      }
    } catch (err) {
      console.error('검색 로그를 큐에 저장하는 과정에서 오류가 발생했습니다', err);
    }
  }

  async saveLogsToDatabase() {
    try {
      const len = await mq.size(this.key);
      if (len === 0) return;
      const messages = await mq.dequeueAll(this.key);
      await SearchLogModel.insertMany(messages);
      console.log('검색 로그를 데이터베이스에 저장했습니다');
    } catch (err) {
      console.error('검색 로그를 데이터베이스에 저장하는 과정에서 오류가 발생했습니다', err);
    }
  }
}

export default new SearchLogQueue();
