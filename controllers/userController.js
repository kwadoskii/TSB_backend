import bcrypt from "bcrypt";
import pick from "lodash/pick.js";
import dot from "dot-object";

import updateOptions from "../helpers/updateOptions.js";
import { User } from "../models/user.js";
import { FollowingTag } from "../models/followingTag.js";
import { followingUser } from "../models/following.js";
import { followerUser } from "../models/follower.js";
import { Post } from "../models/post.js";
import { Comment } from "../models/comment.js";
import { Reaction } from "../models/reaction.js";
import { SavedPost } from "../models/savedPost.js";

const userFields = "firstname middlename lastname username email profileImage";

const list = async (_, res) => {
  const users = await User.find().sort("username").select("-password  -createdAt -updatedAt -__v");

  return res.status(200).send({ status: "success", data: users });
};

const show = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-createdAt -updatedAt -__v -password");
  if (!user)
    return res.status(404).send({ status: "error", message: `User with ID ${id} not found` });

  return res.status(200).send({ status: "success", data: user });
};

const create = async (req, res) => {
  let user = await User.findOne({
    $or: [{ email: req.body.email }, { username: req.body.username }],
  });
  if (user)
    return res
      .status(409) //conflict code
      .send({ status: "error", message: "Username or email already registered." });

  user = new User({ ...req.body });
  const salt = await bcrypt.genSalt();
  user.password = await bcrypt.hash(req.body.password, salt);
  user = await user.save();

  const token = user.generateAuthToken();

  return res.status(201).send({
    status: "success",
    data: { ...pick(user, ["firstname", "lastname", "username", "email"]), token },
  });
};

const update = async (req, res) => {
  const id = req.params.id || req.user._id;

  // if (req.body.password) {
  //   const salt = await bcrypt.genSalt();
  //   req.body.password = await bcrypt.hash(req.body.password, salt);
  // }

  delete req.body.password;

  const user = await User.findByIdAndUpdate(id, { ...dot.dot(req.body) }, updateOptions).select(
    "-password -createdAt -updatedAt -__v"
  );

  if (!user)
    return res.status(404).send({ status: "error", message: `User with ID ${id} not found` });

  return res.status(200).send({ status: "success", data: user });
};

const remove = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);

  if (!user)
    return res.status(404).send({ status: "error", message: `User with ID ${id} not found` });

  return res.status(202).send({ status: "success", message: `User with ID ${id} deleted.` });
};

const followingTags = async (req, res) => {
  const { _id: userId } = req.user;

  const tags = await FollowingTag.findOne({ userId })
    .populate("tagId", "-createdAt -updatedAt -__v")
    .select("-userId -createdAt -updatedAt -__v");

  return res.status(200).send({
    status: "success",
    data: {
      userId,
      tags: tags?.tagId || [],
    },
  });
};

const followTag = async (req, res) => {
  const { id: tagId } = req.params;
  const { _id: userId } = req.user;

  //if user has followed any tag before
  let followed = await FollowingTag.findOne({ userId });
  const hasBeenFollowed = followed?.tagId.filter((t) => t.toString() === tagId);

  if (hasBeenFollowed && hasBeenFollowed.length !== 0)
    return res.status(403).send({ status: "error", message: "You already followed this tag." });

  !followed ? (followed = new FollowingTag({ userId, tagId })) : followed.tagId.push(tagId);

  await followed.save();
  return res.status(200).send({ status: "success", message: `Tag followed.` });
};

const unfollowTag = async (req, res) => {
  const { id: tagId } = req.params;
  const { _id: userId } = req.user;

  let followed = await FollowingTag.findOne({ userId });
  if (!followed)
    return res.status(404).send({ status: "error", message: "You do not follow this tag." });

  const hasBeenFollowed = followed.tagId.filter((t) => t.toString() === tagId);

  if (hasBeenFollowed.length === 0)
    return res.status(404).send({ status: "error", message: "You do not follow this tag." });

  followed.tagId = followed.tagId.filter((t) => t.toString() !== tagId);

  await followed.save();
  return res.status(200).send({ status: "success", message: `Tag unfollowed.` });
};

const followUser = async (req, res) => {
  const { id: userIdToFollow } = req.params;
  const { _id: userId } = req.user;

  if (userId === userIdToFollow)
    return res.status(403).send({ status: "error", message: "Can not follow yourself." });

  let following = await followingUser.findOne({ userId });
  if (!following) {
    following = new followingUser({ followingUserId: userIdToFollow, userId });
  } else {
    const followedBefore = following.followingUserId.filter((f) => f.toString() === userIdToFollow);
    if (followedBefore.length !== 0)
      return res.status(403).send({ status: "error", message: "You already followed this user." });

    following.followingUserId.push(userIdToFollow);
  }

  let follower = await followerUser.findOne({ userId: userIdToFollow });
  if (!follower) {
    follower = new followerUser({ userId: userIdToFollow, followerUserId: userId });
  } else {
    const isFollower = follower.followerUserId.filter((f) => f.toString() === userId);
    if (isFollower.length !== 0)
      return res.status(403).send({ status: "error", message: "You already are a follower." });

    follower.followerUserId.push(userId);
  }

  await Promise.all([following.save(), follower.save()]);
  return res.status(200).send({ status: "success", message: "You followed this user." });
};

const unfollowUser = async (req, res) => {
  const { id: userIdToUnfollow } = req.params;
  const { _id: userId } = req.user;

  if (userId === userIdToUnfollow)
    return res.status(403).send({ status: "error", message: "Can not unfollow yourself." });

  let following = await followingUser.findOne({ userId });
  if (!following)
    return res.status(404).send({ status: "error", message: "You are not following this user." });

  following.followingUserId = following.followingUserId.filter(
    (f) => f.toString() !== userIdToUnfollow
  );

  let follower = await followerUser.findOne({ userId: userIdToUnfollow });
  if (!follower)
    return res
      .status(404)
      .send({ status: "error", message: "You are not a follower of this user." });

  follower.followerUserId = follower.followerUserId.filter((f) => f.toString() !== userId);

  await Promise.all([following.save(), follower.save()]);
  return res.status(200).send({ status: "success", message: "You unfollowed this user." });
};

const followingUsers = async (req, res) => {
  const { _id: userId } = req.user;

  const following = await followingUser
    .findOne({ userId })
    .select("followingUserId -_id")
    .populate("followingUserId", userFields);

  return res.status(200).send({ status: "success", data: following?.followingUserId || [] });
};

const followersList = async (req, res) => {
  const { _id: userId } = req.user;

  const followers = await followerUser
    .findOne({ userId })
    .select("followerUserId -_id")
    .populate("followerUserId", userFields);

  return res.status(200).send({ status: "success", data: followers?.followerUserId || [] });
};

const me = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -__v -createdAt -updatedAt");

  res.status(200).send({ status: "success", data: user });
};

const login = async (req, res) => {
  let user = await User.findOne({
    $or: [{ username: req.body.username }, { email: req.body.username }],
  });

  if (!user)
    return res.status(400).send({ status: "error", message: "Invalid login credentials." });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send({ status: "error", message: "Invalid login credentials." });

  const token = user.generateAuthToken();
  user.lastLogin = new Date();
  user.loginCount++;

  await User.findByIdAndUpdate(user._id, { ...user });

  res.status(200).send({
    status: "success",
    data: {
      user: {
        _id: user._id,
        firstname: user.firstname,
        middlename: user.middlename,
        lastname: user.lastname,
        email: user.email,
        username: user.username,
      },
      token,
    },
  });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { _id: userId } = req.user;

  const user = await User.findById(userId);
  if (!user)
    return res.status(404).send({ status: "error", message: `User with id ${userId} not found.` });

  const passwordIsCorrect = await bcrypt.compare(currentPassword, user.password);
  if (!passwordIsCorrect)
    return res.status(403).send({ status: "error", message: "Wrong current password provided." });

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await User.findByIdAndUpdate(userId, { password: hashedPassword });

  res.status(200).send({ status: "success", message: "Password changed successfully." });
};

const getProfileByUsername = async (req, res) => {
  let user = await User.findOne({ username: req.params.username })
    .select("-password -__v -createdAt -updatedAt")
    .lean();

  if (!user)
    res
      .status(404)
      .send({ status: "error", message: `User with username ${req.params.username} not found.` });

  let postsByUser = await Post.find({ author: user._id })
    .select("-updatedAt -__v")
    .populate("tags", "name")
    .sort("-createdAt");

  let commentsByUser = await Comment.find({ userId: user._id })
    .select("-updatedAt -__v -userId")
    .populate("postId", "title")
    .sort("-createdAt");

  let tagsFollowedByUser = await FollowingTag.findOne({ userId: user._id }).select(
    "-updatedAt -createdAt -__v -userId"
  );

  let data = {};
  data = user;
  data["posts"] = postsByUser;
  data["comments"] = commentsByUser;
  data["followingTags"] = tagsFollowedByUser;

  res.status(200).send({ status: "success", data });
};

const postReactions = async (req, res) => {
  const { _id: userId } = req.user;

  const reactions = await Reaction.find({ userId })
    .populate("postId", "title")
    .select("-userId -createdAt -updatedAt -__v");

  return res.status(200).send({
    status: "success",
    data: {
      userId,
      reactions: reactions,
    },
  });
};

const savedPosts = async (req, res) => {
  const { _id: userId } = req.user;

  let savedPosts = await SavedPost.find({ "userId.user": userId })
    .select("-__v -createdAt -updatedAt")
    .populate({
      path: "postId",
      select: "title slug tags views createdAt",
      populate: { path: "author tags", select: "name firstname lastname username profileImage" },
    })
    .lean();

  for (let savePost of savedPosts) {
    savePost.savedDate =
      savePost.userId
        .filter((u) => u.user.toString() === userId)
        .map((u) => ({ savedDate: u.savedDate }))
        .pop().savedDate || new Date().toISOString();

    //removes userId
    delete savePost.userId;
  }

  return res.status(200).send({ status: "success", data: savedPosts });
};

const savePost = async (req, res) => {
  const { id: postId } = req.params;
  const { _id: userId } = req.user;

  let saved = await SavedPost.findOne({ postId });
  const postHasBeenSaved = saved?.userId?.some((u) => u.user.toString() === userId);

  if (postHasBeenSaved)
    return res.status(403).send({ status: "error", message: "You already saved this post." });

  !saved
    ? (saved = new SavedPost({ userId: { user: userId }, postId }))
    : saved.userId.push({ user: userId });
  await saved.save();

  res.status(200).send({ status: "success", message: "Post saved." });
};

const unsavePost = async (req, res) => {
  const { id: postId } = req.params;
  const { _id: userId } = req.user;

  let saved = await SavedPost.findOne({ postId });
  if (!saved)
    return res.status(404).send({ status: "error", message: "You have not saved this post." });

  const hasPostBeenSaved = saved.userId.some((u) => u.user.toString() === userId);

  if (!hasPostBeenSaved)
    return res.status(404).send({ status: "error", message: "You have not saved this post." });

  saved.userId = saved.userId.filter((u) => u.user.toString() !== userId);
  await saved.save();

  return res.status(200).send({ status: "success", message: "Post unsaved." });
};

const getTotalUserCount = async (_, res) => {
  const userCount = await User.find().count();

  return res.status(200).send({ status: "success", data: userCount });
};

const postsByUser = async (req, res) => {
  const { _id: userId } = req.user;

  let posts = await Post.find({ author: userId })
    .populate({ path: "tags", select: "name" })
    .populate("author", "firstname lastname username profileImage")
    .select("-updatedAt -__v")
    .sort("-createdAt")
    .lean();

  for (const post of posts) {
    let likes = await Reaction.findOne({ postId: post._id }).select("userId").lean();
    let commentsCount = await Comment.find({ postId: post._id }).count();

    post.likesCount = likes?.userId.length || 0;

    post.commentsCount = commentsCount;
  }

  return res.status(200).send({ status: "success", data: posts });
};

const commentsByUser = async (req, res) => {
  const { _id: userId } = req.user;

  const comments = await Comment.find({ userId })
    .populate({ path: "userId", select: "username" })
    .select("-updatedAt -__v")
    .sort("-createdAt");

  return res.status(200).send({ status: "success", data: comments });
};

export default {
  list,
  show,
  create,
  update,
  remove,
  followingTags,
  followTag,
  unfollowTag,
  followUser,
  unfollowUser,
  followingUsers,
  followersList,
  me,
  login,
  getProfileByUsername,
  postReactions,
  savedPosts,
  savePost,
  unsavePost,
  getTotalUserCount,
  postsByUser,
  commentsByUser,
  changePassword,
};
