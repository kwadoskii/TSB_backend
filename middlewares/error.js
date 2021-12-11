export default function error(err, req, res, next) {
  //checks for when a unique key is violated and returns the appropriate error code
  if (err.name === "ValidationError") {
    const formatMessage = err.toString().replace("ValidationError: ", "").replace(":", "");
    return res.status(422).send({
      status: "DB Validation error",
      message: `${formatMessage[0].toUpperCase() + formatMessage.substr(1)}`,
    });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(422).send({
      status: "Syntax Error",
      message: err.message,
    });
  }

  console.error(err.stack);

  return res.status(500).send("Something went wrong!");
}
