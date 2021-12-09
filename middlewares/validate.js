export default (validator) => {
  return (req, res, next) => {
    const { error } = validator(req.body, { abortEarly: false }); //used to display all error messages
    if (error)
      return res.status(400).send({
        status: "Validation error",
        message: error.details.map((err) => err.message.replace(/\"/g, "")),
      });

    next();
  };
};
