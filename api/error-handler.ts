import { Request, Response, NextFunction } from 'express';
import { ErrorLogModel } from './database/mongoose/models/ErrorLog';
import userAgentUtil from './util/user-agent';

export const requestErrorHandler = async (error: any, req: Request, res: Response, next: NextFunction) => {
  const userAgentDetail = req.useragent;
  const userAgent = userAgentUtil.parseUserAgent(userAgentDetail);
  const newError = {
    userAgent: userAgent,
    message: error.message,
    stack: error.stack
  };

  try {
    await ErrorLogModel.create(newError);
  } catch (err) {
    console.error('Insert errorlog failed', err);
  }

  console.error('요청을 처리하는 과정에서 오류가 발생했습니다\n', error);
  res.status(400).json({ message: error.message });
};
