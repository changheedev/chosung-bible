export default class SearchLog {
  constructor() {}
  static init(mongoose) {
    return mongoose.model("SearchLog", {
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
      date: Date
    });
  }
}
