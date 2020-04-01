import express = require('express');
import bible from './bible';
import review from './review';

const router = express.Router();

router.use('/bible', bible);
router.use('/reviews', review);

export default router;
