import Review from '../../database/mongoose/models/Review';
import UseragentUtil from '../../util/useragent';
import { Details } from 'express-useragent';

class ReviewService {
  private static _instance: ReviewService;

  private constructor() {
    if (!ReviewService._instance) {
      ReviewService._instance = this;
    }
    return ReviewService._instance;
  }

  async createReview(useragentDetail: Details | undefined, content: string) {
    try {
      const useragent = UseragentUtil.parseUseragent(useragentDetail);
      const newReview = {
        useragent: useragent,
        content: content
      };
      await Review.create(newReview);
      console.log('Insert review...');
    } catch (err) {
      throw err;
    }
  }

  static getInstance() {
    return new ReviewService();
  }
}

export default ReviewService.getInstance();
