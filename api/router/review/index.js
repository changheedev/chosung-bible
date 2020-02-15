import express from "express";
import MongoDB from "../../database/mongodb";

const router = express.Router();

const Review = MongoDB.models.Review;

router.post("/", async (req, res, next) => {
  try {
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
    await Review.create(newReview);
    console.log("Insert review...");
    res.status(201).json({ message: "OK" });
  } catch (err) {
    next(err);
  }
});

export default router;
