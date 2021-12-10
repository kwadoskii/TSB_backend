import express from "express";
import error from "../middlewares/error.js";
import tags from "../routes/tags.js";
import status from "../routes/status.js";
import users from "../routes/users.js";

export default function (app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/status", status);
  app.use("/api/tags", tags);
  app.use("/api/users", users);

  app.use(error);
}
