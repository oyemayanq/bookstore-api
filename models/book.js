const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Book model
/*
  {
    _id: mongodb id
    title string required
    image string default ""
    authors []string required
    genres []string required
    publication string required
    publicationDate date required
    ISBN string required
    description string
    rating Number Default 0
    numRatings Number Default 0
    price Number required
    user references user
  }
*/

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    rating: { type: Number, required: true },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

const bookSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  authors: [
    {
      type: String,
      required: true,
    },
  ],
  genres: [
    {
      type: String,
      required: true,
    },
  ],
  description: {
    type: String,
  },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    default: 0,
  },
  numberOfRatings: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
  },
  publisher: {
    type: String,
    required: true,
  },
  publishedDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
