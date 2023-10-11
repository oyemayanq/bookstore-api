class HttpError extends Error {
  constructor(message, errorCode, errors = null) {
    super(message);
    this.code = errorCode;
    this.errors = errors;
  }
}

module.exports = HttpError;
