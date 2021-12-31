import express from "express";

import userController from "../controllers/userController.js";
import validate from "../middlewares/validate.js";
import { validateUser } from "../models/user.js";

const router = express.Router();

router.post("/", validate(validateUser), userController.create);

export default router;
