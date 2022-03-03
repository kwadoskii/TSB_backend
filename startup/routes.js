import express from "express";

import error from "../middlewares/error.js";
import tags from "../routes/tags.js";
import status from "../routes/status.js";
import users from "../routes/users.js";
import posts from "../routes/posts.js";
import auth from "../routes/auth.js";
import register from "../routes/register.js";

export default function (app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/status", status);
  app.use("/api/tags", tags);
  app.use("/api/users", users);
  app.use("/api/posts", posts);
  app.use("/api/auth", auth);
  app.use("/api/register", register);

  app.use(error);
}
