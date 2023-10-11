const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const Book = require("../models/book");

async function signup(req, res, next) {
  const { validator } = req;

  if (validator.hasErrors()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data.",
      400,
      validator.getErrors()
    );

    return next(error);
  }

  const { name, email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Signing up failed, please try again later.", 500)
    );
  }

  if (user) {
    const error = new HttpError(
      "user already exists, please login instead",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }
  console.log("hash", hashedPassword);

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign({ userId: createdUser._id }, process.env.JWT_KEY);
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(201).json({ token: token });
}

async function login(req, res, next) {
  const { validator } = req;

  if (validator.hasErrors()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data.",
      422,
      validator.getErrors()
    );

    return next(error);
  }

  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Logging in failed, please try again later.", 500)
    );
  }

  if (!user) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (err) {
    return next(
      new HttpError("Logging in failed, please try again later.", 500)
    );
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign({ userId: user.id }, process.env.JWT_KEY);
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  res.json({ token: token });
}

async function getBooksByUserId(req, res, next) {
  let books;
  let user;
  const userId = req.userId;

  try {
    books = await Book.find({ user: userId }).select(["_id", "title"]);
    user = await User.findById(userId).select("name");
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Something went wrong, could not find books.",
      500
    );
    return next(error);
  }

  res.status(200).json({ books, user });
}

exports.signup = signup;
exports.login = login;
exports.getBooksByUserId = getBooksByUserId;
