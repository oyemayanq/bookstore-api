const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const booksRoutes = require("./routes/book-routes");
const userRoutes = require("./routes/user-routes");
const orderRoutes = require("./routes/order-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

const dirname = path.resolve();
app.use("/uploads", express.static(path.join(dirname, "uploads")));

app.use(cors());

app.use("/api/books", booksRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

app.use((req, res, next) => {
  const error = new HttpError("resource not found", 404);
  throw error;
});

app.use((err, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }

  if (res.headerSent) {
    return next(err);
  }

  console.log(err);

  res.status(err.code || 500);
  res.json({ message: err.message || "Something went wrong with the server" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@bookstore.mlbplu8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(8080, () => {
      console.log("connected to the database");
      console.log("starting server on port 8080");
    });
  })
  .catch((err) => {
    console.log(err);
  });
