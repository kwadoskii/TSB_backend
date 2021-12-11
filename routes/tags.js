import express from "express";
import tagController from "../controllers/tagController.js";
import admin from "../middlewares/admin.js";
import validate from "../middlewares/validate.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import { validatePatchTag, validateTag } from "../models/tag.js";

const router = express.Router();

router.get("/", tagController.list);

router.get("/:id", validateObjectId, tagController.show);

router.post("/", [admin, validate(validateTag)], tagController.create);

router.patch("/:id", [admin, validateObjectId, validate(validatePatchTag)], tagController.update);

router.delete("/:id", [admin, validateObjectId], tagController.remove);

export default router;
