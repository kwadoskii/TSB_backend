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
  const { userId } = req.body;

  const tags = await followingTag
    .find({ userId })
    .populate("tagId", "name -_id")
    .select("-userId -createdAt -updatedAt -__v");

  return res.status(200).send({
    status: "success",
    data: {
      userId,
      tags: tags.map((t) => {
        return { _id: t._id, name: t.tagId[0].name };
      }),
    },
  });
};

const followTag = async (req, res) => {
  const { userId, tagId } = req.body;

  const followed = await followingTag.find({ userId, tagId });

  if (followed)
    return res.status(404).send({ status: "error", message: "You already followed this tag." });

  followed = new followingTag({ userId, tagId });
  await followed.save();

  return res.status(200).send({ status: "success", message: `Tag followed.` });
};

const unfollowTag = async (req, res) => {
  const { userId, tagId } = req.body;

  const unfollowed = await followingTag.findOneAndRemove({ userId, tagId });
  if (!unfollowed)
    return res.status(404).send({ status: "error", message: "You do not follow this tag." });

  return res.status(200).send({ status: "success", message: `Tag unfollowed.` });
};

const followUser = async (req, res) => {
  const { id: userIdToFollow } = req.params;
  const { userId } = req.body;

  //check if my id matches followerUserId and return error
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
  const { userId } = req.body;

  if (userId === userIdToUnfollow)
    return res.status(403).send({ status: "error", message: "Can not unfollow yourself." });

  let following = await followingUser.findOne({ userId });
  if (!following) {
    return res.status(404).send({ status: "error", message: "You are not following this user." });
  } else {
    following.followingUserId = following.followingUserId.filter(
      (f) => f.toString() !== userIdToUnfollow
    );
  }

  let follower = await followerUser.findOne({ userId: userIdToUnfollow });
  if (!follower) {
    return res
      .status(404)
      .send({ status: "error", message: "You are not a follower of this user." });
  } else {
    follower.followerUserId = follower.followerUserId.filter((f) => f.toString() !== userId);
  }

  await Promise.all([following.save(), follower.save()]);

  return res.send("unfollow user");
};

const followingUsers = async (req, res) => {
  const { userId } = req.body;

  const following = await followingUser
    .findOne({ userId })
    .select("followingUserId -_id")
    .populate("followingUserId", userFields);

  return res.status(200).send({ status: "success", data: following?.followingUserId || [] });
};

const followersList = async (req, res) => {
  const { userId } = req.body;

  const followers = await followerUser
    .findOne({ userId })
    .select("followerUserId -_id")
    .populate("followerUserId", userFields);

  return res.status(200).send({ status: "success", data: followers?.followerUserId || [] });
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
};
