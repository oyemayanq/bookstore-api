const fs = require("fs");

const Book = require("../models/book");
const HttpError = require("../models/http-error");

async function getBookById(req, res, next) {
  const { bookId } = req.params;

  let book;
  try {
    book = await Book.findById(bookId).populate({
      path: "reviews",
      populate: {
        path: "user",
        select: "name",
      },
    });
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Something went wrong, could not find the book.", 500)
    );
  }

  if (!book) {
    const error = new HttpError(
      "Could not find the book for the provided id.",
      404
    );
    return next(error);
  }

  res.status(200).json({ book });
}

async function getBooks(req, res, next) {
  let books;
  let count;

  const { searchKey, page = 1 } = req.query;
  const pageSize = 9;
  const skip = (page - 1) * pageSize;

  const searchQuery = searchKey
    ? {
        $or: [
          { title: { $regex: new RegExp(searchKey, "i") } },
          { authors: { $regex: new RegExp(searchKey, "i") } },
          { genres: { $regex: new RegExp(searchKey, "i") } },
        ],
      }
    : {};

  try {
    count = await Book.countDocuments();
    books = await Book.find(searchQuery).skip(skip).limit(pageSize);
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Could not get books, please try again later.", 500)
    );
  }

  res.json({ books, count });
}

async function createBook(req, res, next) {
  const { validator } = req;

  if (validator.hasErrors()) {
    const error = new HttpError(
      "Invalid inputs passed",
      422,
      validator.getErrors()
    );

    return next(error);
  }

  const {
    title,
    authors,
    genres,
    description = "",
    price,
    publisher,
    publishedDate,
  } = req.body;

  //console.log("req");

  const book = new Book({
    user: req.userId,
    title,
    image: req?.file?.path || "",
    authors,
    genres,
    description,
    price,
    publisher,
    publishedDate,
  });

  console.log(book);

  try {
    await book.save();
  } catch (err) {
    const error = new HttpError(
      "Could not save the book, please try again.",
      500
    );
    return next(error);
  }

  res.json({ book });
}

async function updateBookById(req, res, next) {
  const { validator } = req;

  if (validator.hasErrors()) {
    const error = new HttpError(
      "Invalid inputs passed",
      422,
      validator.getErrors()
    );

    return next(error);
  }

  const { bookId } = req.params;

  const {
    title,
    authors,
    genres,
    description = "",
    price,
    publisher,
    publishedDate,
  } = req.body;

  let book;

  try {
    book = await Book.findById(bookId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update the book.",
      500
    );
    return next(error);
  }

  if (!book) {
    const error = new HttpError("Could not find the book and update it.", 404);
    return next(error);
  }

  const oldImagePath = book.image;

  book.title = title || book.title;
  book.image = req?.file?.path || book.image;
  book.authors = authors || book.authors;
  book.genres = genres || book.genres;
  book.description = description || book.description;
  book.price = price || book.price;
  book.publisher = publisher || book.publisher;
  book.publishedDate = publishedDate || book.publishedDate;

  try {
    await book.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update the book.",
      500
    );
    return next(error);
  }

  if (oldImagePath !== "") {
    fs.unlink(oldImagePath, (err) => {
      console.log(err);
    });
  }

  res.status(200).json({ book });
}

async function deleteBookById(req, res, next) {
  const { bookId } = req.params;

  let book;
  try {
    book = await Book.findByIdAndRemove(bookId);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Something went wrong, could not delete the book.",
      500
    );
    return next(error);
  }

  if (!book) {
    const error = new HttpError("Could not find the book to delete.", 404);
    return next(error);
  }

  fs.unlink(book.image, (err) => {
    console.log(err);
  });

  res.status(200).json({ bookId: book._id, message: "Book deleted" });
}

async function createBookReviewById(req, res, next) {
  const { validator } = req;

  if (validator.hasErrors()) {
    const error = new HttpError(
      "Invalid inputs passed",
      422,
      validator.getErrors()
    );

    return next(error);
  }

  const { bookId } = req.params;

  let book;
  try {
    book = await Book.findById(bookId);
  } catch (err) {
    const error = new HttpError("Could not add review.", 500);
    return next(error);
  }

  if (!book) {
    const error = new HttpError("Book does not exists.", 404);
    return next(error);
  }

  const alreadyReviewed = book.reviews.find(
    (r) => r.user.toString() === req.userId
  );

  if (alreadyReviewed) {
    const error = new HttpError("Book already reviewed", 400);
    return next(error);
  }

  const { rating, comment = "" } = req.body;

  const review = {
    user: req.userId,
    rating: rating,
    comment: comment,
  };

  book.reviews.push(review);
  book.numberOfRatings = book.numberOfRatings + 1;
  book.rating =
    book.reviews.reduce((prev, item) => prev + item.rating, 0) /
    book.numberOfRatings;

  try {
    await book.save();
  } catch (err) {
    const error = new HttpError("Could not add review", 500);
    return next(error);
  }

  res.status(200).json({ book });
}

async function getEditBookById(req, res, next) {
  const { bookId } = req.params;

  let book;
  try {
    book = await Book.findById(bookId).select("-reviews");
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Something went wrong, could not find the book.", 404)
    );
  }

  if (!book) {
    const error = new HttpError(
      "Could not find the book for the provided id.",
      404
    );
    return next(error);
  }

  res.status(200).json({ book });
}

exports.getBookById = getBookById;
exports.getBooks = getBooks;
exports.createBook = createBook;
exports.updateBookById = updateBookById;
exports.deleteBookById = deleteBookById;
exports.createBookReviewById = createBookReviewById;
exports.getEditBookById = getEditBookById;
