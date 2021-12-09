import mongoose from "mongoose";

export default (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send({ status: "error", message: "Invalid ID" });

  next();
};
