export default class UserAgent {
  private device: string;
  private browser: string;
  private version: string;
  private os: string;
  private platform: string;

  constructor(userAgent) {
    if (userAgent.isMobile) this.device = 'mobile';
    else if (userAgent.isTablet) this.device = 'tablet';
    else if (userAgent.isDesktop) this.device = 'desktop';
    else if (userAgent.isBot) this.device = 'bot';
    else this.device = 'unkown';

    this.browser = userAgent.browser;
    this.version = userAgent.version;
    this.os = userAgent.os;
    this.platform = userAgent.platform;
  }

  toObject(): Object {
    return { ...this };
  }
}
