import express from "express";

import postController from "../controllers/postController.js";
import admin from "../middlewares/admin.js";
import me from "../middlewares/me.js";
import validate from "../middlewares/validate.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import { validatePost, validatePostPatch } from "../models/post.js";

const router = express.Router();

router.get("/", postController.list);

router.get("/:id", validateObjectId, postController.show);

// add auth validation middleware here
router.post("/", validate(validatePost), postController.create);

router.patch("/:id", [validateObjectId, validate(validatePostPatch)], postController.update);

router.delete("/:id", [admin, me, validateObjectId], postController.remove);

export default router;
