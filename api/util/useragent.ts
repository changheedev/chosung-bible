import { Details } from 'express-useragent';

type Useragent = {
  device: {
    typeName: string;
    os: string;
    platform: string;
  };
  browser: {
    name: string;
    version: string;
  };
};

class UseragentUtil {
  private UNKNOWN_VALUE = 'unknown';

  constructor() {}

  parseUseragent(useragentDetail: Details | undefined): Useragent {
    return {
      device: this.parseDeviceInfo(useragentDetail),
      browser: this.parseBrowserInfo(useragentDetail)
    };
  }

  private parseDeviceInfo(useragentDetail: Details | undefined) {
    if (!useragentDetail)
      return {
        typeName: this.UNKNOWN_VALUE,
        os: this.UNKNOWN_VALUE,
        platform: this.UNKNOWN_VALUE
      };

    return {
      typeName: this.parseDeviceType(useragentDetail),
      os: useragentDetail.os,
      platform: useragentDetail.platform
    };
  }

  private parseDeviceType(useragent: Details) {
    if (useragent.isMobile) return 'mobile';
    if (useragent.isTablet) return 'tablet';
    if (useragent.isDesktop) return 'desktop';
    if (useragent.isBot) return 'bot';
    return this.UNKNOWN_VALUE;
  }

  private parseBrowserInfo(useragentDetail: Details | undefined) {
    if (!useragentDetail)
      return {
        name: this.UNKNOWN_VALUE,
        version: this.UNKNOWN_VALUE
      };

    return {
      name: useragentDetail.browser,
      version: useragentDetail.version
    };
  }
}

export default new UseragentUtil();
