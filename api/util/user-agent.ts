import { Details } from 'express-useragent';
import { UserAgent } from '../database/mongoose/models/user-agent';

class UserAgentUtil {
  private UNKNOWN_VALUE = 'unknown';

  constructor() {}

  parseUserAgent(userAgentDetail: Details | undefined): UserAgent {
    return {
      device: this.parseDeviceInfo(userAgentDetail),
      browser: this.parseBrowserInfo(userAgentDetail)
    };
  }

  private parseDeviceInfo(userAgentDetail: Details | undefined) {
    if (!userAgentDetail)
      return {
        typeName: this.UNKNOWN_VALUE,
        os: this.UNKNOWN_VALUE,
        platform: this.UNKNOWN_VALUE
      };

    return {
      typeName: this.parseDeviceType(userAgentDetail),
      os: userAgentDetail.os,
      platform: userAgentDetail.platform
    };
  }

  private parseDeviceType(userAgent: Details) {
    if (userAgent.isMobile) return 'mobile';
    if (userAgent.isTablet) return 'tablet';
    if (userAgent.isDesktop) return 'desktop';
    if (userAgent.isBot) return 'bot';
    return this.UNKNOWN_VALUE;
  }

  private parseBrowserInfo(userAgentDetail: Details | undefined) {
    if (!userAgentDetail)
      return {
        name: this.UNKNOWN_VALUE,
        version: this.UNKNOWN_VALUE
      };

    return {
      name: userAgentDetail.browser,
      version: userAgentDetail.version
    };
  }
}

export default new UserAgentUtil();
