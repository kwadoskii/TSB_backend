import express from "express";

import userController from "../controllers/userController.js";
import auth from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import { validateAuth, validateChangePassword } from "../models/user.js";

const router = express.Router();

router.post("/login", validate(validateAuth), userController.login);
router.post(
  "/changepassword",
  [auth, validate(validateChangePassword)],
  userController.changePassword
);

export default router;
