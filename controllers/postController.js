import dot from "dot-object";

import { Post } from "../models/post.js";
import { SavedPost } from "../models/savedPost.js";
import updateOptions from "../helpers/updateOptions.js";
import { Reaction } from "../models/reaction.js";

const authorFields = "firstname middlename lastname username email profileImage";
const tagsFields = "-_id name";
dot.keepArray = true;

const list = async (_, res) => {
  const posts = await Post.find().sort("createdAt").populate("author", authorFields);

  return res.status(200).send({ status: "success", data: posts });
};

const show = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findByIdAndUpdate(id, { $inc: { views: 1 } })
    .select("-__v -updatedAt")
    .populate("author", authorFields);

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

const search = async (req, res) => {
  const { q } = req.query;

  const posts = await Post.find({
    $or: [{ title: { $regex: ".*" + q + ".*" } }, { content: { $regex: ".*" + q + ".*" } }],
  })
    .populate("author", authorFields)
    .populate("tags", tagsFields);

  return res.status(200).send({ status: "success", data: posts });
};

const save = async (req, res) => {
  const { userId, postId } = req.body;
  const savedBefore = await SavedPost.findOneAndDelete({ userId, postId }); //removes like if it exists

  if (savedBefore)
    return res.status(200).send({ status: "success", message: `Post ${postId} unsaved.` });

  const savedPost = new SavedPost({ userId, postId });
  await savedPost.save();

  return res.status(200).send({ status: "success", message: `Post ${postId} saved.` });
};

const reaction = async (req, res) => {
  const { userId, postId } = req.body;
  const likedBefore = await Reaction.findOneAndDelete({ userId, postId });

  if (likedBefore)
    return res.status(200).send({ status: "success", message: `Post ${postId} unliked.` });

  const likedPost = new Reaction({ userId, postId });
  await likedPost.save();

  return res.status(200).send({ status: "success", message: `Post ${postId} liked.` });
};

export default {
  list,
  show,
  create,
  update,
  remove,
  search,
  save,
  reaction,
};
