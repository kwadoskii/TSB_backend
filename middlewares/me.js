export default (req, res, next) => {
  // if (!req.user.isAdmin) return res.status(403).send("Access denied.");
  // check for  the user in the header and grant access or not

  next();
};
