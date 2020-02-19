import express from "express";
import bible from "./bible";
import review from "./review";
import MongoDB from "../database/mongodb";

const ErrorLog = MongoDB.models.ErrorLog;

const router = express.Router();

router.use("/bible", bible);
router.use("/reviews", review);

//error handling
router.use(async (error, req, res, next) => {
  try {
    const ua = req.useragent;
    const newError = {
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
      message: error.message,
      stack: error.stack
    };
    console.error("An error occurred for the following reason:\n", err);
    await ErrorLog.create(newError);
  } catch (err) {
    console.error("Insert errorlog failed", err);
  }

  res.status(400).json({ message: error.message });
});

export default router;
