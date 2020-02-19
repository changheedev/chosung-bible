import express from "express";
import { sequelize, models } from "../../database/sequelize";
import { Sequelize } from "sequelize";
import LogQueue from "../../util/log-queue";

const router = express.Router();

/* sequelize, mariadb */
const Op = Sequelize.Op;
const Bible = models.Bible;
const Book = models.Book;

//초기화 데이터 캐시
const cache = {
  books: null,
  metadata: null
};

router.get(
  "/book/:book/chapter/:chapter/verse/:verse",
  async (req, res, next) => {
    try {
      const book = Number(req.params.book);
      const chapter = Number(req.params.chapter);
      const verse = Number(req.params.verse);
      const page = Number(req.query.page) || 0;

      //사용자가 입력한 성경부터 10개의 데이터를 가져온다
      //사용자가 입력한 파라미터를 서브쿼리로 이용
      const result = await Bible.findAll({
        where: {
          id: {
            [Op.gte]: sequelize.literal(
              `(select id from tbl_bible where book = ${book} and chapter = ${chapter} and verse = ${verse})`
            )
          }
        },
        offset: page * 10,
        limit: 10
      });
      LogQueue.insertLog(req.useragent, req.url);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * 키워드 검색, fulltext index
 */
router.get("", async (req, res, next) => {
  try {
    const keyword = decodeURIComponent(req.query.keyword);
    const keywordTokens = keyword.split(" ");
    const keywordQuery = keywordTokens.map(token => `+${token}*`).join(" ");
    const page = Number(req.query.page);

    const result = await Bible.findAll({
      where: Sequelize.literal(`MATCH (content) AGAINST ('${keyword}')`),
      order: [
        sequelize.literal(`MATCH (content) AGAINST ('"${keyword}"') DESC`),
        sequelize.literal(`MATCH (content) AGAINST ('${keywordQuery}') DESC`),
        ["book", "ASC"],
        ["chapter", "ASC"],
        ["verse", "ASC"]
      ],
      offset: page * 10,
      limit: 10
    });

    let keywordSet = [];
    keywordSet.push(keyword);
    keywordSet = keywordSet.concat(keywordTokens);

    LogQueue.insertLog(req.useragent, decodeURIComponent(req.url));
    res.status(200).json({ data: result, keywordSet: keywordSet });
  } catch (err) {
    next(err);
  }
});

/*성경리스트('창세기', '출애굽기',...)를 불러온다*/
router.get("/books", async (req, res, next) => {
  try {
    //캐시된 데이터가 있다면 사용
    if (cache.books) {
      res.status(200).json(cache.books);
      return;
    }

    const result = await Book.findAll();
    //캐시에 저장
    cache.books = result;
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

/* 성경별로 장마다 몇절까지 있는지의 데이터를 가져온다 */
router.get("/metadata", async (req, res, next) => {
  try {
    //캐시된 데이터가 있다면 사용
    if (cache.metadata) {
      res.status(200).json(cache.metadata);
      return;
    }

    // {book, maxChapter}
    const metaMaxChapters = await sequelize.query(
      "select book, max(chapter) as maxChapter from tbl_bible group by book"
    );

    // {book, chapter, maxVerse}
    const metaMaxVerses = await sequelize.query(
      "select book, chapter, count(verse) as maxVerse from tbl_bible group by book, chapter"
    );

    let resResult = [];

    metaMaxChapters[0].forEach(_metaMaxChapter => {
      resResult.push({
        book: _metaMaxChapter.book,
        maxChapter: _metaMaxChapter.maxChapter,
        maxVerses: metaMaxVerses[0]
          .filter(_metaMaxVerse => _metaMaxVerse.book === _metaMaxChapter.book)
          .map(_filteredMetaMaxVerse => _filteredMetaMaxVerse.maxVerse)
      });
    });

    //캐시에 저장
    cache.metadata = resResult;
    res.status(200).json(resResult);
  } catch (err) {
    next(err);
  }
});

export default router;
