const express = require("express");
const router = express.Router();
const Bible = require("../sequelize/models/bible");
const Book = require("../sequelize/models/book");

router.get("/hello", (req, res) => {
  res.send("hello");
});

router.get("/bible/:book/:chapter/:verse", (req, res) => {
  const book = Number(req.params.book);
  const chapter = Number(req.params.chapter);
  const verse = Number(req.params.verse);

  Bible.findOne({
    where: { book: book, chapter: chapter, verse: verse }
  })
    .then(bible => res.send(bible))
    .catch(err => {
      console.log("error", err);
    });
});

router.get("/bible/books", (req, res) => {
  Book.findAll()
    .then(books => res.send(books))
    .catch(err => {
      console.log("error", err);
    });
});

module.exports = router;
