import admin from "./admin.js";
import auth from "./auth.js";

export default (req, res, next) => {
  // check if request initiator is an admin or an auth user

  auth(req, res, function () {
    if (req.user !== undefined || req.user.isAdmin) next();

    return res.send("auth or admin error");
  });
};
