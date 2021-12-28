import jwt from "jsonwebtoken";

export default function (req, res, next) {
  const token =
    req.header("x-auth-token") &&
    req.header("x-auth-token").split(" ")[0] === "JWT" &&
    req.header("x-auth-token").split(" ")[1];

  if (!token)
    return res.status(401).send({ status: "error", message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    req.user = decoded;

    next();
  } catch (ex) {
    console.log(ex);
    return res.status(400).send({ status: "error", message: "Invalid token provided." });
  }
}
