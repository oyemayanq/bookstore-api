const express = require("express");

const validator = require("../models/validator");
const booksControllers = require("../controllers/books-controllers");
const checkAuth = require("../middlewares/check-auth");
const filleUpload = require("../middlewares/file-upload");
const { DateRegex } = require("../helpers/constants");

const router = express.Router();

router.get("/", booksControllers.getBooks);

router.get("/:bookId", booksControllers.getBookById);

router.use(checkAuth);

function validateBook(req, res, next) {
  const v = validator();

  v.minLength(req, "title", 3, "title should be at least 3 characters long");

  v.minLength(req, "authors", 1, "enter the name of at least one author");

  v.minLength(req, "genres", 1, "enter at least one genre");

  v.minValue(req, "price", 1, "price cannot be 0");
  v.minLength(req, "publisher", 1, "publisher cannot be empty");

  v.match(
    req,
    DateRegex,
    "publishedDate",
    "publishedDate should be in YYYY-MM-DD format"
  );
  req.validator = v;

  next();
}

function validateReview(req, res, next) {
  const v = validator();

  v.minValue(req, "rating", 1, "rating should be greater than or equal to 1");

  v.maxValue(req, "rating", 5, "rating should be less than or equal to 1");

  req.validator = v;

  next();
}

router.post(
  "/",
  [filleUpload.single("image"), validateBook],
  booksControllers.createBook
);

router.patch(
  "/:bookId",
  [filleUpload.single("image"), validateBook],
  booksControllers.updateBookById
);

router.delete("/:bookId", booksControllers.deleteBookById);

router.post(
  "/:bookId/reviews",
  [validateReview],
  booksControllers.createBookReviewById
);

router.get("/edit/:bookId", booksControllers.getEditBookById);

module.exports = router;
