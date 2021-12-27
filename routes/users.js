import express from "express";

import admin from "../middlewares/admin.js";
import me from "../middlewares/me.js";
import validate from "../middlewares/validate.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import { validateUser, validatePatchUser } from "../models/user.js";
import userController from "../controllers/userController.js";

const router = express.Router();

router.get("/", userController.list);
router.get("/tags", [validateObjectId, me], userController.followingTags);
router.post("/tags/follow", me, userController.followTag);
router.post("/tags/unfollow", me, userController.unfollowTag);

// user followers and following
router.post("/follow/:id", [validateObjectId, me], userController.followUser);
router.post("/unfollow/:id", [validateObjectId, me], userController.unfollowUser);

router.get("/followers", me, userController.followersList);
router.get("/following", me, userController.followingUsers);

router.get("/:id", validateObjectId, userController.show);
router.post("/", validate(validateUser), userController.create);
router.patch("/:id", [admin, me, validate(validatePatchUser)], userController.update);
router.delete("/:id", [admin, me, validateObjectId], userController.remove);

export default router;
