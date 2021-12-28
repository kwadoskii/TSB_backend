import dot from "dot-object";

import updateOptions from "../helpers/updateOptions.js";
import { Tag } from "../models/tag.js";

const list = async (_, res) => {
  const tags = await Tag.find().sort("name");

  return res.status(200).send({ status: "success", data: tags });
};

const show = async (req, res) => {
  const { id } = req.params;
  const tag = await Tag.findById(id);
  if (!tag)
    return res.status(404).send({ status: "error", message: `Tag with ID ${id} not found` });

  return res.status(200).send({ status: "success", data: tag });
};

const create = async (req, res) => {
  let tag = new Tag({ ...req.body });
  tag = await tag.save();

  return res.status(201).send({ status: "success", data: tag });
};

const update = async (req, res) => {
  const { id } = req.params;
  const tag = await Tag.findByIdAndUpdate(id, { ...dot.dot(req.body) }, updateOptions);

  if (!tag)
    return res.status(404).send({ status: "error", message: `Tag with ID ${id} not found` });

  return res.status(200).send({ status: "success", data: tag });
};

const remove = async (req, res) => {
  const { id } = req.params;
  const tag = await Tag.findByIdAndDelete(id);

  if (!tag)
    return res.status(404).send({ status: "error", message: `Tag with ID ${id} not found` });

  return res.status(202).send({ status: "success", message: `Tag with ID ${id} deleted.` });
};

export default {
  list,
  show,
  create,
  update,
  remove,
};
