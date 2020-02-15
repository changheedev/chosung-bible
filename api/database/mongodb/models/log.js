export default class Log {
  constructor() {}
  static init(mongoose) {
    return mongoose.model("Log", {
      useragent: {
        isMobile: Boolean,
        isTablet: Boolean,
        isDesktop: Boolean,
        isBot: Boolean,
        browser: String,
        version: String,
        os: String,
        platform: String
      },
      query: String,
      state: Boolean,
      date: Date
    });
  }
}
