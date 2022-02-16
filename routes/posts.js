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
router.post("/like", [auth, validate(validateReaction)], postController.reaction); //like a post (deprecated)

//more last 5 post from author
router.get("/morefromauthor/:id", postController.moreFromAuthor);

//like and unlike post
router.post("/like/:id", [auth, validateObjectId], postController.likePost);
router.post("/unlike/:id", [auth, validateObjectId], postController.unlikePost);

router.get("/comments/:id", validateObjectId, postController.showComment);
router.post("/comments", [auth, validate(validateComment)], postController.comment);

//like and unlike a comment
router.post("/comments/like/:id", [auth, validateObjectId], postController.likeComment);
router.post("/comments/unlike/:id", [auth, validateObjectId], postController.unlikeComment);

router.delete("/comments/:id", [auth, validateObjectId], postController.removeComment);

//posts by tag for week, month, year, infinity and latest
router.get("/getpostsbytagname/:name", postController.getPostsByTagName);

//post details
router.get("/:id", validateObjectId, postController.show);
router.get("/slug/:slug", validateObjectId, postController.getPostBySlug);
router.get("/:id/comments", validateObjectId, postController.postComments);
router.get("/:id/likes", validateObjectId, postController.postLikes); //likes to a post
router.get("/:id/saves", validateObjectId, postController.postSaves); // post saves

// add auth validation middleware here
router.post("/", [auth, validate(validatePost)], postController.create);
router.patch("/:id", [auth, validateObjectId, validate(validatePostPatch)], postController.update);
router.delete("/:id", [auth, validateObjectId], postController.remove);

export default router;
