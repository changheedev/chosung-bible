import { mongoDB } from "../database/mongodb";
import Queue from "./queue";

class LogUtils {
  constructor() {
    this.Log = mongoDB.models.Log;
    //큐에 쌓인 로그를 주기적으로 db에 저장
    const timer = setInterval(() => {
      if (Queue.isEmpty()) return;
      this.Log.insertMany(Queue.dequeueAll(), err => {
        if (err) {
          console.error("Insert log failed.", err);
          return;
        }
        console.log("insert log...");
      });
    }, process.env.LOG_INTERVAL);
  }

  insertLog(ua, query, state) {
    Queue.enqueue({
      useragent: {
        isMobile: ua.isMobile,
        isTablet: ua.isTablet,
        isDesktop: ua.isDesktop,
        isBot: ua.isBot,
        browser: ua.browser,
        version: ua.version,
        os: ua.os,
        platform: ua.platform
      },
      query: query,
      state: state,
      date: Date.now()
    });
  }
}

export default new LogUtils();
