import express from "express";
import updateOptions from "../helpers/updateOptions.js";
import admin from "../middlewares/admin.js";
import validate from "../middlewares/validate.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import { Tag, validatePatchTag, validateTag } from "../models/tag.js";

const router = express.Router();

router.get("/", async (_, res) => {
  const tags = await Tag.find().sort("name");

  return res.status(200).send(tags);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const { id } = req.params;
  const tag = await Tag.findById(id);
  if (!tag)
    return res.status(404).send({ status: "error", message: `Tag with ID ${id} not found` });

  return res.status(200).send(tag);
});

router.post("/", [admin, validate(validateTag)], async (req, res) => {
  let tag = new Tag({ ...req.body });
  tag = await tag.save();

  return res.status(201).send({ status: "success", data: tag });
});

router.patch("/:id", [admin, validateObjectId, validate(validatePatchTag)], async (req, res) => {
  const { id } = req.params;
  const tag = await Tag.findByIdAndUpdate(id, { ...req.body }, updateOptions);

  if (!tag)
    return res.status(404).send({ status: "error", message: `Tag with ID ${id} not found` });

  return res.status(200).send({ status: "success", data: tag });
});

router.delete("/:id", [admin, validateObjectId], async (req, res) => {
  const { id } = req.params;

  const tag = await Tag.findByIdAndDelete(id);
  if (!tag)
    return res.status(404).send({ status: "error", message: `Tag with ID ${id} not found` });

  return res.status(202).send({ status: "success", message: `Tag with ID ${id} deleted.` });
});

export default router;
