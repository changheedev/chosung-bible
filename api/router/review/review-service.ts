import { ReviewModel } from '../../database/mongoose/models/Review';
import UserAgentUtil from '../../util/user-agent';
import { Details } from 'express-useragent';

class ReviewService {
  constructor() {}

  async createReview(userAgentDetail: Details | undefined, content: string) {
    try {
      const userAgent = UserAgentUtil.parseUserAgent(userAgentDetail);
      const newReview = {
        userAgent: userAgent,
        content: content
      };
      await ReviewModel.create(newReview);
      console.log('Insert review...');
    } catch (err) {
      throw err;
    }
  }
}

export default new ReviewService();
