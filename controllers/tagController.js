import dot from "dot-object";

import updateOptions from "../helpers/updateOptions.js";
import { Tag } from "../models/tag.js";
import { Post } from "../models/post.js";

const list = async (_, res) => {
  let tags = await Tag.find().sort("name").lean();
  const counts = [];

  for (let tag of tags) {
    counts.push({
      _id: tag._id,
      count: (await Post.find({ tags: tag._id })).length,
    });
  }

  tags = tags.map((t) => {
    return { ...t, postCount: counts.find((c) => c._id === t._id).count };
  });

  return res.status(200).send({ status: "success", data: tags });
};

const show = async (req, res) => {
  const { id } = req.params;
  const tag = await Tag.findById(id).lean();

  if (!tag)
    return res.status(404).send({ status: "error", message: `Tag with ID ${id} not found` });

  tag.postCount = await Post.find({ tags: id }).count();

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
