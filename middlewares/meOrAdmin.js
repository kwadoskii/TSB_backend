export default (req, res, next) => {
  // if (!req.user.isAdmin) return res.status(403).send("Access denied.");
  // check for  the user in the header and grant access or not

  // const token = req.header("x-auth-token");
  // if (!token)
  //   return res.status(401).send({ status: "error", message: "Access denied. No token provided." });

  // check if request initiator is an admin or an auth user

  next();
};
