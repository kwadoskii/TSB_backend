import mongoose from "mongoose";

export default (req, res, next) => {
  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send({ status: "error", message: "Invalid ID provided" });

  if (req.body.userId && !mongoose.Types.ObjectId.isValid(req.body.userId))
    return res.status(400).send({ status: "error", message: "Invalid ID provided" });

  next();
};
