import express = require('express');
import { Request, Response, NextFunction } from 'express';
import bible from './bible';
import review from './review';
import ErrorLog from '../database/mongodb/models/error-log';
import UserAgent from '../models/user-agent';

const router = express.Router();

router.use('/bible', bible);
router.use('/reviews', review);

//error handling
router.use(async (error: any, req: Request, res: Response, next: NextFunction) => {
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
});

export default router;
