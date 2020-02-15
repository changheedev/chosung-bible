export default class Review {
  constructor() {}
  static init(mongoose) {
    return mongoose.model("Review", {
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
      content: String,
      date: { type: Date, default: Date.now }
    });
  }
}
