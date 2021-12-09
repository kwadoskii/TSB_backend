import express from "express";
import error from "../middlewares/error.js";
import status from "../routes/status.js";

export default function (app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/status", status);
  // app.use("/api/customers", customers);
  // app.use("/api/movies", movies);
  // app.use("/api/rentals", rentals);
  // app.use("/api/users", users);
  // app.use("/api/auth", auth);
  // app.use("/api/returns", returns);

  app.use(error);
}
