import express from "express";

import admin from "../middlewares/admin.js";
import me from "../middlewares/me.js";
import validate from "../middlewares/validate.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import { validateUser, validatePatchUser } from "../models/user.js";
import userController from "../controllers/userController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", [auth, admin], userController.list);
router.get("/me", auth, userController.me);
router.get("/tags", auth, userController.followingTags);
router.post("/tags/follow/:id", auth, userController.followTag);
router.post("/tags/unfollow/:id", auth, userController.unfollowTag);

// user followers and following
router.post("/follow/:id", [auth, validateObjectId], userController.followUser);
router.post("/unfollow/:id", [auth, validateObjectId], userController.unfollowUser);

router.get("/followers", auth, userController.followersList);
router.get("/following", auth, userController.followingUsers);

// router.get("/:id", validateObjectId, userController.show);
router.get("/:username", auth, userController.getProfileByUsername);
router.post("/", validate(validateUser), userController.create); //register user
router.patch("/:id", [auth, validate(validatePatchUser)], userController.update);
router.delete("/:id", [auth, validateObjectId], userController.remove);

export default router;
