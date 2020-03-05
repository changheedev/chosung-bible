import express = require('express');
import LogQueue from '../../util/log-queue';
import BibleService from './bibleService';

const router = express.Router();

//초기화 데이터 캐시
const cache = {};

/* 성경 리스트와 메타데이터를 가져온다. */
router.get('/metadata', async (req, res, next) => {
  try {
    //캐시된 데이터가 있다면 사용
    if (cache['metadata']) {
      res.status(200).json(cache['metadata']);
      return;
    }
    const metadata = await BibleService.getBibleMeta();
    cache['metadata'] = metadata;
    res.status(200).json(metadata);
  } catch (err) {
    next(err);
  }
});

/* 메타데이터로 성경 검색 */
router.get('/book/:book/chapter/:chapter/verse/:verse', async (req, res, next) => {
  try {
    const book = Number(req.params.book);
    const chapter = Number(req.params.chapter);
    const verse = Number(req.params.verse);
    const page = Number(req.query.page) || 0;

    const result = await BibleService.searchBibleByMeta(book, chapter, verse, page);

    LogQueue.insertLog({ ...req.useragent }, { book: book, chapter: chapter, verse: verse, page: page });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

/* 키워드 검색, fulltext index */
router.get('', async (req, res, next) => {
  try {
    const keyword = decodeURIComponent(req.query.keyword);
    const page = Number(req.query.page);

    const result = await BibleService.searchBibleByKeyword(keyword, page);

    LogQueue.insertLog({ ...req.useragent }, { keyword: keyword, page: page });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
