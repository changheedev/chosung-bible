import { Request, Response, NextFunction } from 'express';
import ErrorLog from './database/mongoose/models/ErrorLog';
import UserAgent from './models/UserAgent';

export const requestErrorHandler = async (error: any, req: Request, res: Response, next: NextFunction) => {
  try {
    const ua = req.useragent;
    const useragent = new UserAgent(ua);
    const newError = {
      useragent: useragent.toObject(),
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
