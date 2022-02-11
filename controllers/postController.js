import dot from "dot-object";

import { Post } from "../models/post.js";
import { SavedPost } from "../models/savedPost.js";
import updateOptions from "../helpers/updateOptions.js";
import { Reaction } from "../models/reaction.js";
import { Comment } from "../models/comment.js";
import { Tag } from "../models/tag.js";

const authorFields = "firstname middlename lastname username email profileImage";
const tagsFields = "-_id name";
dot.keepArray = true;

const list = async (_, res) => {
  const posts = await Post.find()
    .sort("-createdAt")
    .populate("author", authorFields)
    .populate("tags", tagsFields);

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
  let str = "1234567890qwertyuiopasdfghjklzxcvbnm";
  let lastStr = "";

  for (let i = 0; i < 4; i++) {
    lastStr = lastStr + str[Math.floor(Math.random() * str.length)];
  }

  post.slug =
    req.body.title.toLowerCase().trim().replace(/\s/g, " ").split(" ").join("-") + "-" + lastStr;
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

//deprecated
const reaction = async (req, res) => {
  const { userId, postId } = req.body;
  const likedBefore = await Reaction.findOneAndDelete({ userId, postId });

  if (likedBefore)
    return res.status(200).send({ status: "success", message: `Post ${postId} unliked.` });

  const likedPost = new Reaction({ userId, postId });
  await likedPost.save();

  return res.status(200).send({ status: "success", message: `Post ${postId} liked.` });
};

const comment = async (req, res) => {
  const { userId, postId, comment } = req.body;
  const newComment = new Comment({ userId, postId, comment });

  await newComment.save();
  return res.status(201).send({ status: "success", message: "Comment added." });
};

const showComment = async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id)
    .select("-__v -updatedAt")
    .populate({
      path: "postId",
      select: "title author slug",
      populate: {
        path: "author",
        select: "username",
      },
    })
    .populate("userId", "firstname lastname email username");

  if (!comment)
    return res.status(404).send({ status: "error", message: `Comment with ID ${id} not found.` });

  return res.status(200).send({ status: "success", data: comment });
};

const likeComment = async (req, res) => {
  const { id: commentId } = req.params;
  const { _id: userId } = req.user;

  const comment = await Comment.findById(commentId);

  if (!comment)
    return res
      .status(404)
      .send({ status: "error", message: `Comment with id ${commentId} not found.` });

  const liked = comment.likes.some((id) => userId === id.toString());

  if (liked) return res.status(403).send({ status: "error", message: "Comment already liked." });

  comment.likes.push(userId);

  await comment.save();
  return res.status(200).send({ status: "success", message: `Comment ${commentId} liked.` });
};

const unlikeComment = async (req, res) => {
  const { id: commentId } = req.params;
  const { _id: userId } = req.user;

  const comment = await Comment.findById(commentId);

  if (!comment)
    return res
      .status(404)
      .send({ status: "error", message: `Comment with id ${commentId} not found.` });

  const liked = comment.likes.some((id) => userId === id.toString());

  if (!liked) return res.status(403).send({ status: "error", message: "Comment not liked." });

  comment.likes = comment.likes.filter((id) => id.toString() !== userId);
  await comment.save();

  res.status(200).send({ status: "success", message: "Comment unliked." });
};

const removeComment = async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findByIdAndDelete(id);

  if (!comment)
    return res.status(404).send({ status: "error", message: `Comment with ID ${id} not found.` });

  return res.status(202).send({ status: "success", message: `Comment with ID ${id} deleted.` });
};

const postComments = async (req, res) => {
  const { id } = req.params;

  const postComments = await Comment.find({ postId: id })
    .select("-__v -updatedAt -postId")
    .populate("userId", "username firstname lastname profileImage")
    .sort("-createdAt");

  return res.status(200).send({ status: "success", data: postComments });
};

const postLikes = async (req, res) => {
  const { id } = req.params;
  const postComments = await Reaction.findOne({ postId: id }).select("-__v -updatedAt -createdAt");

  return res.status(200).send({ status: "success", data: postComments });
};

const likePost = async (req, res) => {
  const { id: postId } = req.params;
  const { _id: userId } = req.user;

  //if user has liked any post before
  let postLikes = await Reaction.findOne({ postId });

  const postHasBeenLiked = postLikes?.userId.some((u) => u.toString() === userId);

  if (postHasBeenLiked)
    return res.status(403).send({ status: "error", message: "You already liked this post." });

  !postLikes ? (postLikes = new Reaction({ userId, postId })) : postLikes.userId.push(userId);

  await postLikes.save();
  return res.status(200).send({ status: "success", message: `Post liked.` });
};

const unlikePost = async (req, res) => {
  const { id: postId } = req.params;
  const { _id: userId } = req.user;

  let postLikes = await Reaction.findOne({ postId });
  if (!postLikes)
    return res.status(404).send({ status: "error", message: "You have not liked this post." });

  const hasPostBeenLiked = postLikes.userId.some((u) => u.toString() === userId);

  if (!hasPostBeenLiked)
    return res.status(404).send({ status: "error", message: "You have not liked this post." });

  postLikes.userId = postLikes.userId.filter((u) => u.toString() !== userId);

  await postLikes.save();
  return res.status(200).send({ status: "success", message: `Post unliked.` });
};

const getPostsByTagName = async (req, res) => {
  const { name: tagName } = req.params;

  const tagID = await (await Tag.findOne({ name: tagName }))?._id;

  if (!tagID)
    return res.status(404).send({ status: "error", message: `Tag ${tagName} not found.` });

  const posts = await Post.find({ tags: tagID })
    .sort("-views")
    .populate("author", authorFields)
    .populate("tags", tagsFields);

  return res.status(200).send({ status: "success", data: posts });
};

const getPostBySlug = async (req, res) => {
  const { slug } = req.params;

  const post = await Post.findOneAndUpdate({ slug }, { $inc: { views: 1 } })
    .populate("author", authorFields + " profileImage occupation location education joined")
    .populate("tags", "-createdAt -updatedAt -description -image");

  if (!post)
    return res
      .status(404)
      .send({ status: "error", message: `Post with slug '${slug}' not found.` });

  return res.status(200).send({ status: "success", data: post });
};

const moreFromAuthor = async (req, res) => {
  const { id } = req.params;
  const posts = await Post.find({ author: id })
    .sort("-views -createdAt")
    .limit(5)
    .populate("author", authorFields)
    .populate("tags", "name");

  res.status(200).send({ status: "success", data: posts });
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
  comment,
  likeComment,
  removeComment,
  showComment,
  postComments,
  postLikes,
  likePost,
  unlikePost,
  getPostsByTagName,
  getPostBySlug,
  moreFromAuthor,
  unlikeComment,
};
