import { Router } from 'express';
import BibleService from './bible-service';

const router = Router();

//초기화 데이터 캐시
let cacheMeta: Object;

/* 성경 리스트와 메타데이터를 가져온다. */
router.get('/metadata', async (req, res, next) => {
  try {
    //캐시된 데이터가 있다면 사용
    if (cacheMeta) {
      res.status(200).json(cacheMeta);
      return;
    }
    const metadata = await BibleService.getBibleMeta();
    cacheMeta = { ...metadata };
    res.status(200).json(metadata);
  } catch (err) {
    next(err);
  }
});

/* 메타데이터로 성경 검색 */
router.get('/book/:book/chapter/:chapter/verse/:verse', async (req, res, next) => {
  try {
    const result = await BibleService.searchBibleByMeta(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

/* 키워드 검색, fulltext index */
router.get('', async (req, res, next) => {
  try {
    const result = await BibleService.searchBibleByKeyword(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
