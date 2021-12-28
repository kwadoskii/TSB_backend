import bcrypt from "bcrypt";
import pick from "lodash/pick.js";
import dot from "dot-object";

import updateOptions from "../helpers/updateOptions.js";
import { User } from "../models/user.js";
import { followingTag } from "../models/followingTag.js";
import { followingUser } from "../models/following.js";
import { followerUser } from "../models/follower.js";

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
  if (user) return res.status(400).send("Username or email already registered.");

  user = new User({ ...req.body });
  const salt = await bcrypt.genSalt();
  user.password = await bcrypt.hash(req.body.password, salt);
  user = await user.save();

  return res.status(201).send({
    status: "success",
    data: pick(user, ["firstname", "lastname", "username", "email"]),
  });
};

const update = async (req, res) => {
  const { id } = req.params;

  if (req.body.password) {
    const salt = await bcrypt.genSalt();
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

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

  const tags = await followingTag
    .findOne({ userId })
    .populate("tagId", "name -_id")
    .select("-userId -createdAt -updatedAt -__v");

  return res.status(200).send({
    status: "success",
    data: {
      userId,
      tags: tags.tagId,
    },
  });
};

const followTag = async (req, res) => {
  const { id: tagId } = req.params;
  const { _id: userId } = req.user;

  let followed = await followingTag.findOne({ userId });
  const hasBeenFollowed = followed?.tagId.filter((t) => t.toString() === tagId);

  if (hasBeenFollowed && hasBeenFollowed.length !== 0)
    return res.status(403).send({ status: "error", message: "You already followed this tag." });

  !followed ? (followed = new followingTag({ userId, tagId })) : followed.tagId.push(tagId);

  await followed.save();
  return res.status(200).send({ status: "success", message: `Tag followed.` });
};

const unfollowTag = async (req, res) => {
  const { id: tagId } = req.params;
  const { _id: userId } = req.user;

  let followed = await followingTag.findOne({ userId });
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
  return res.status(201).send({ status: "success", message: "You followed this user." });
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
  return res.send({ status: "success", message: "You unfollowed this user." });
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

const auth = async (req, res) => {
  let user = await User.findOne({
    $or: [{ username: req.body.username }, { email: req.body.username }],
  });

  if (!user) return res.status(400).send("Invalid login credentials.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid login credentials.");

  const token = user.generateAuthToken();

  res.status(200).send({
    status: "success",
    user: {
      _id: user._id,
      firstname: user.firstname,
      middlename: user.middlename,
      lastname: user.lastname,
      email: user.email,
    },
    accessToken: token,
  });
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
  auth,
};
