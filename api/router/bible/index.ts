import { Router, Request, Response, NextFunction } from 'express';
import BibleService from './bible-service';
import cache from '../../util/cache';
import logQueue from '../../util/searchlog-queue';

const router = Router();

/* 성경 리스트와 메타데이터를 가져온다. */
router.get('/metadata', async (req, res, next) => {
  try {
    const key = 'metadata';
    const dataFromCache = await cache.getAsync(key);
    if (dataFromCache) {
      res.status(200).json(dataFromCache);
      return;
    }

    const metadata = await BibleService.getBibleMeta();
    await cache.setAsync(key, metadata);
    res.status(200).json(metadata);
  } catch (err) {
    next(err);
  }
});

/* 메타데이터로 성경 검색 */
router.get('/book/:book/chapter/:chapter/verse/:verse', validateMeta, async (req, res, next) => {
  try {
    const params = {
      book: Number(req.params.book),
      chapter: Number(req.params.chapter),
      verse: Number(req.params.verse),
      page: Number(req.query.page || 0)
    };

    const query = req.url;

    const dataFromCache = await cache.getAsync(query);
    if (dataFromCache) {
      await logQueue.insertLog(req.useragent, query, 'cache');
      res.status(200).json(dataFromCache);
      return;
    }

    const result = await BibleService.searchBibleByMeta(params);
    await cache.setAsync(query, result);
    await logQueue.insertLog(req.useragent, query, 'db');
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

/* 키워드 검색, fulltext index */
router.get('', validateKeyword, async (req, res, next) => {
  try {
    const params = {
      keyword: decodeURIComponent(req.query.keyword),
      book: Number(req.query.book),
      page: Number(req.query.page || 0)
    };

    const query = `?keyword=${params.keyword}&book=${params.book}&page=${params.page}`;

    const dataFromCache = await cache.getAsync(query);
    if (dataFromCache) {
      await logQueue.insertLog(req.useragent, query, 'cache');
      res.status(200).json(dataFromCache);
      return;
    }

    const result = await BibleService.searchBibleByKeyword(params);
    await cache.setAsync(query, result);
    await logQueue.insertLog(req.useragent, query, 'db');
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

function validateMeta(req: Request, res: Response, next: NextFunction) {
  const book = Number(req.params.book);
  const chapter = Number(req.params.chapter);
  const verse = Number(req.params.verse);
  const page = Number(req.query.page || 0);

  if (
    Number.isNaN(book) ||
    Number.isNaN(chapter) ||
    Number.isNaN(verse) ||
    Number.isNaN(page) ||
    book === 0 ||
    chapter === 0 ||
    verse === 0
  ) {
    next(new Error('parameter가 올바르지 않습니다'));
    return;
  }
  next();
}

function validateKeyword(req: Request, res: Response, next: NextFunction) {
  const keyword = req.query.keyword;
  const book = Number(req.query.book);
  const page = Number(req.query.page);

  if (!keyword || Number.isNaN(book) || Number.isNaN(page)) {
    next(new Error('parameter가 올바르지 않습니다'));
    return;
  }
  next();
}

export default router;
