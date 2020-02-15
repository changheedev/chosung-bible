import express from "express";
import { sequelize, models } from "../../database/sequelize";
import { Sequelize } from "sequelize";
import LogUtils from "../../util/log-utils";

const router = express.Router();

/* sequelize, mariadb */
const Op = Sequelize.Op;
let Bible = models.Bible;
let Book = models.Book;

router.get("/book/:book/chapter/:chapter/verse/:verse", async (req, res) => {
  const book = Number(req.params.book);
  const chapter = Number(req.params.chapter);
  const verse = Number(req.params.verse);
  const page = Number(req.query.page) || 0;

  //사용자가 입력한 성경부터 10개의 데이터를 가져온다
  //사용자가 입력한 파라미터를 서브쿼리로 이용
  await Bible.findAll({
    where: {
      id: {
        [Op.gte]: sequelize.literal(
          `(select id from tbl_bible where book = ${book} and chapter = ${chapter} and verse = ${verse})`
        )
      }
    },
    offset: page * 10,
    limit: 10
  })
    .then(bible => {
      LogUtils.insertLog(req.useragent, req.url, true);
      res.status(200).json(bible);
    })
    .catch(err => {
      LogUtils.insertLog(req.useragent, req.url, false);
      console.error("error", err);
    });
});

/*성경리스트('창세기', '출애굽기',...)를 불러온다*/
router.get("/books", (req, res) => {
  Book.findAll()
    .then(books => res.status(200).json(books))
    .catch(err => {
      console.error("error", err);
    });
});

/* 성경별로 장마다 몇절까지 있는지의 데이터를 가져온다 */
router.get("/metadata", async (req, res) => {
  // {book, maxChapter}
  const metaMaxChapters = (
    await sequelize.query(
      "select book, max(chapter) as maxChapter from tbl_bible group by book"
    )
  )[0];

  // {book, chapter, maxVerse}
  const metaMaxVerses = (
    await sequelize.query(
      "select book, chapter, count(verse) as maxVerse from tbl_bible group by book, chapter"
    )
  )[0];

  let resResult = [];

  metaMaxChapters.forEach(_metaMaxChapter => {
    /*
    [
      {
        book: 1, 
        maxChapter: 50, 
        maxVerses: [
          {
            book: 1, 
            chapter: 1, 
            maxVerse: 31
          }, 
          ...
        ]
      }
    ]
    */
    resResult.push({
      book: _metaMaxChapter.book,
      maxChapter: _metaMaxChapter.maxChapter,
      maxVerses: metaMaxVerses.filter(
        _metaMaxVerse => _metaMaxVerse.book === _metaMaxChapter.book
      )
    });
  });

  res.status(200).json(resResult);
});

export default router;
