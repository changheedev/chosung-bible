import express = require('express');
import bible from './bible';
import review from './review';

const router = express.Router();

router.use('/bible', bible);
router.use('/reviews', review);
router.get('/health-check', (req, res, next) => {
  res.send('OK');
});

export default router;
