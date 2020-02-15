import express from "express";
import { mongoDB } from "../../database/mongodb";

const router = express.Router();

const Review = mongoDB.models.Review;

router.post("/", (req, res) => {
  const ua = req.useragent;
  const newReview = {
    useragent: {
      isMobile: ua.isMobile,
      isTablet: ua.isTablet,
      isDesktop: ua.isDesktop,
      isBot: ua.isBot,
      browser: ua.browser,
      version: ua.version,
      os: ua.os,
      platform: ua.platform
    },
    content: req.body.content
  };

  Review.create(newReview, function(err, result) {
    if (err) {
      console.err(err);
      res.status(400).send("리뷰를 저장하는데 실패했습니다.");
      return;
    }
    console.log("insert review...");
    res.status(201).send("소중한 의견 감사드립니다.");
  });
});

export default router;
