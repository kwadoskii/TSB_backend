// const winston = require("winston");

export default function error(err, req, res, next) {
  // winston.error(err.message, err);
  console.error(err.stack);

  // error
  // warn
  // info
  // verbose
  // debug
  // silly

  res.status(500).send("Something went wrong!");
}
