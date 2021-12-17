import express from "express";

import admin from "../middlewares/admin.js";
import me from "../middlewares/me.js";
import postController from "../controllers/postController.js";
import validate from "../middlewares/validate.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import { validateSavedPost } from "../models/savedPost.js";
import { validatePost, validatePostPatch } from "../models/post.js";
import { validateReaction } from "../models/reaction.js";

const router = express.Router();

router.get("/", postController.list);
router.get("/search", postController.search);
router.post("/save", validate(validateSavedPost), postController.save); //save a post
router.post("/like", validate(validateReaction), postController.reaction); //like a post
router.get("/:id", validateObjectId, postController.show);

// add auth validation middleware here
router.post("/", validate(validatePost), postController.create);
router.patch("/:id", [validateObjectId, validate(validatePostPatch)], postController.update);
router.delete("/:id", [admin, me, validateObjectId], postController.remove);

export default router;
