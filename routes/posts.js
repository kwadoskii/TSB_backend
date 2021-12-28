import express from "express";

import admin from "../middlewares/admin.js";
import me from "../middlewares/me.js";
import postController from "../controllers/postController.js";
import validate from "../middlewares/validate.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import { validateSavedPost } from "../models/savedPost.js";
import { validatePost, validatePostPatch } from "../models/post.js";
import { validateReaction } from "../models/reaction.js";
import { validateComment, validateCommentLike } from "../models/comment.js";
import authOrAdmin from "../middlewares/authOrAdmin.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", postController.list);
router.get("/search", postController.search);
router.post("/save", [auth, validate(validateSavedPost)], postController.save); //save a post
router.post("/like", [auth, validate(validateReaction)], postController.reaction); //like a post
router.post("/comment", [auth, validate(validateComment)], postController.comment);
router.post("/comment/like", [auth, validate(validateCommentLike)], postController.likeComment);
router.delete("/comment/:id", [auth, validateObjectId], postController.removeComment);

router.get("/:id", validateObjectId, postController.show);

// add auth validation middleware here
router.post("/", [auth, validate(validatePost)], postController.create);
router.patch("/:id", [auth, validateObjectId, validate(validatePostPatch)], postController.update);
router.delete("/:id", [auth, validateObjectId], postController.remove);

export default router;
