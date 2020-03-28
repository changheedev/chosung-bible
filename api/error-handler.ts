import { Request, Response, NextFunction } from 'express';
import ErrorLog from './database/mongoose/models/ErrorLog';
import useragentUtil from './util/useragent';

export const requestErrorHandler = async (error: any, req: Request, res: Response, next: NextFunction) => {
  try {
    const useragentDetail = req.useragent;
    const useragent = useragentUtil.parseUseragent(useragentDetail);
    const newError = {
      useragent: useragent,
      message: error.message,
      stack: error.stack
    };
    console.error('An error occurred for the following reason:\n', error);
    await ErrorLog.create(newError);
  } catch (err) {
    console.error('Insert errorlog failed', err);
  }

  res.status(400).json({ message: error.message });
};
