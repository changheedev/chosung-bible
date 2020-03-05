import express = require('express');
import ReviewService from './review-service';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    ReviewService.createReview({ ...req.useragent }, req.body.content);
    res.status(201).json({ message: 'OK' });
  } catch (err) {
    next(err);
  }
});

export default router;
