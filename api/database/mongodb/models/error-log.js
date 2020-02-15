export default class ErrorLog {
  constructor() {}
  static init(mongoose) {
    return mongoose.model("ErrorLog", {
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
      message: String,
      stack: String,
      date: { type: Date, default: Date.now }
    });
  }
}
