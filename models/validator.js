class Validator {
  constructor() {
    this.errors = {};
    this.isValid = true;
  }

  addError(key, errorMessage) {
    this.errors[key] = errorMessage;
    this.isValid = false;
  }

  getErrors() {
    return this.errors;
  }

  existCheck(req, key) {
    if (req.body[key]) {
      return true;
    }
    this.check(
      false,
      key,
      `${key.substring(0, 1).toUpperCase()}${key.substring(1)} cannot be empty`
    );
    return false;
  }

  check(result, key, errorMessage) {
    if (!result) {
      this.addError(key, errorMessage);
    }
  }

  match(req, regex, value, message) {
    if (!this.existCheck(req, value)) {
      return;
    }

    this.check(regex.test(req.body[value]), value, message);
  }

  minLength(req, value, length, message) {
    if (!this.existCheck(req, value)) {
      return;
    }
    this.check(req.body[value].length >= length, value, message);
  }

  minValue(req, value, minimumValue, message) {
    if (!this.existCheck(req, value)) {
      return;
    }

    this.check(req.body[value] >= minimumValue, value, message);
  }

  maxValue(req, value, maximumValue, message) {
    if (!this.existCheck(req, value)) {
      return;
    }

    this.check(req.body[value] <= maximumValue, value, message);
  }

  hasErrors() {
    return !this.isValid;
  }
}

function NewValidator() {
  return new Validator();
}

module.exports = NewValidator;
