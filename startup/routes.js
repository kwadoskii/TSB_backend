import express from "express";
import error from "../middlewares/error.js";
import tag from "../routes/tag.js";
import status from "../routes/status.js";

export default function (app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/status", status);
  app.use("/api/tags", tag);

  app.use(error);
}
