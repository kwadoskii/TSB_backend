import { User } from "../models/user.js";

export default async (req, res, next) => {
  const user = await User.findById(req.user._id).select("isAdmin -_id");
  req.user.isAdmin = user.isAdmin;

  if (!user.isAdmin)
    return res
      .status(403)
      .send({ status: "error", message: "Access denied because user is not admin." });

  next();
};
