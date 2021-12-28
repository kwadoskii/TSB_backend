import auth from "../middlewares/auth.js";

export default function (req, res, next) {
  //  checks if the record was posted by the user requesting to modify/edit it

  // check for this in the controllers before modifying them.

  auth(req, res, function () {
    if (req.body._id !== req.user._id)
      return res
        .status(401)
        .send({ status: "error", message: "User does not have rights to modify this data." });

    next();
  });
}
