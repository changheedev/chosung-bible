import express from "express";
import { models } from "../sequelize";

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
    .then(bible => res.send(bible))
    .catch(err => {
      console.error("error", err);
    });
});

router.get("/bible/books", (req, res) => {
  Book.findAll()
    .then(books => res.send(books))
    .catch(err => {
      console.error("error", err);
    });
});

export default router;
