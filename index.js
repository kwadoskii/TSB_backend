import dotenv from "dotenv";
import express from "express";
import config from "./startup/config.js";
import cors from "./startup/cors.js";
import db from "./startup/db.js";
import logging from "./startup/logging.js";
import routes from "./startup/routes.js";
import validation from "./startup/validation.js";

dotenv.config();
const app = express();

logging();
cors(app);
routes(app);
db();
config();
validation();

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
