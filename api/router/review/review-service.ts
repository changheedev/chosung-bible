import Review from '../../database/mongoose/models/Review';
import UserAgent from '../../models/UserAgent';
import { Details } from 'express-useragent';

class ReviewService {
  private static _instance: ReviewService;

  private constructor() {
    if (!ReviewService._instance) {
      ReviewService._instance = this;
    }
    return ReviewService._instance;
  }

  async createReview(ua: Details | undefined, content: string) {
    try {
      const useragent = new UserAgent(ua);
      const newReview = {
        useragent: useragent.toObject(),
        content: content
      };
      await Review.create(newReview);
      console.log('Insert review...');
    } catch (err) {
      throw new Error(err);
    }
  }

  static getInstance() {
    return new ReviewService();
  }
}

export default ReviewService.getInstance();
