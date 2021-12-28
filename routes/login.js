import express from "express";

import userController from "../controllers/userController.js";
import validate from "../middlewares/validate.js";
import { validateAuth } from "../models/user.js";

const router = express.Router();

router.post("/", validate(validateAuth), userController.auth);

export default router;
