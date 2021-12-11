import { Post } from "../models/post.js";
import dot from "dot-object";
import updateOptions from "../helpers/updateOptions.js";

const authorFields = "firstname middlename lastname username email profileImage";
dot.keepArray = true;

const list = async (_, res) => {
  const posts = await Post.find().sort("createdAt").populate("author", authorFields);

  return res.status(200).send({ status: "success", data: posts });
};

const show = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id).select("-__v -updatedAt").populate("author", authorFields);

  if (!post)
    return res.status(404).send({ status: "error", message: `Post with ID ${id} not found.` });

  return res.status(200).send({ status: "success", data: post });
};

const create = async (req, res) => {
  const post = new Post({ ...req.body });
  post.slug = req.body.title.toLowerCase().split(" ").join("-");
  await post.save();

  return res.status(201).send({ status: "success", data: post });
};

const update = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findByIdAndUpdate(id, { ...dot.dot(req.body) }, updateOptions).select(
    "-createdAt -updatedAt -__v"
  );

  if (!post)
    return res.status(404).send({ status: "error", message: `Post with ID ${id} not found.` });

  return res.status(200).send({ status: "success", data: post });
};

const remove = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findByIdAndDelete(id);

  if (!post)
    return res.status(404).send({ status: "error", message: `Post with ID ${id} not found.` });

  return res.status(202).send({ status: "success", message: `Post with ID ${id} deleted.` });
};

export default {
  list,
  show,
  create,
  update,
  remove,
};
