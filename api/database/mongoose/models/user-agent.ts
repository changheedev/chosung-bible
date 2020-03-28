export type UserAgent = {
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

export const UserAgentSchema = {
  userAgent: {
    device: {
      typeName: String,
      os: String,
      platform: String
    },
    browser: {
      name: String,
      version: String
    }
  }
};
