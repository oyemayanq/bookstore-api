const express = require("express");

const usersControllers = require("../controllers/users-controllers");
const { EmailRegex } = require("../helpers/constants");
const NewValidator = require("../models/validator");
const Auth = require("../middlewares/check-auth");

const router = express.Router();

function validateEmailPassword(req, res, next) {
  const v = NewValidator();

  v.minLength(req, "email", 1, "provide valid email");

  v.match(req, EmailRegex, "email", "provide valid email");

  v.minLength(
    req,
    "password",
    6,
    "password should be at least 6 characters long"
  );

  req.validator = v;

  next();
}

function validateName(req, res, next) {
  const { validator } = req;

  validator.minLength(
    req,
    "name",
    3,
    "name should be at least 3 characters long"
  );

  req.validator = validator;

  next();
}

router.post("/login", validateEmailPassword, usersControllers.login);

router.post(
  "/signup",
  [validateEmailPassword, validateName],
  usersControllers.signup
);

router.use(Auth);

router.get("/books", usersControllers.getBooksByUserId);

module.exports = router;
