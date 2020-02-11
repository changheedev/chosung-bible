import express from "express";
import { sequelize, models } from "../sequelize";

const router = express.Router();
let Bible = models.Bible;
let Book = models.Book;

router.get("/bible/:book/:chapter/:verse", (req, res) => {
  const book = Number(req.params.book);
  const chapter = Number(req.params.chapter);
  const verse = Number(req.params.verse);

  Bible.findOne({
    where: { book: book, chapter: chapter, verse: verse }
  })
    .then(bible => res.status(200).json(bible))
    .catch(err => {
      console.error("error", err);
    });
});

/*성경리스트('창세기', '출애굽기',...)를 불러온다*/
router.get("/bible/books", (req, res) => {
  Book.findAll()
    .then(books => res.status(200).json(books))
    .catch(err => {
      console.error("error", err);
    });
});

/* 성경별로 장마다 몇절까지 있는지의 데이터를 가져온다 */
router.get("/bible/metadata", async (req, res) => {
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
