import express from "express";
import admin from "../middlewares/admin.js";
import me from "../middlewares/me.js";
import validate from "../middlewares/validate.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import { User, validateUser, validatePatchUser } from "../models/user.js";
import bcrypt from "bcrypt";
import updateOptions from "../helpers/updateOptions.js";
import dot from "dot-object";
import pick from "lodash/pick.js";

const router = express.Router();

router.get("/", async (_, res) => {
  const users = await User.find().sort("username").select("-password  -createdAt -updatedAt -__v");

  return res.status(200).send({ status: "success", data: users });
});

router.get("/:id", validateObjectId, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-createdAt -updatedAt -__v -password");
  if (!user)
    return res.status(404).send({ status: "error", message: `User with ID ${id} not found` });

  return res.status(200).send({ status: "success", data: user });
});

router.post("/", validate(validateUser), async (req, res) => {
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
});

router.patch("/:id", [
  admin,
  me,
  validate(validatePatchUser),
  async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { ...dot.dot(req.body) }, updateOptions).select(
      "-password -createdAt -updatedAt -__v"
    );

    if (!user)
      return res.status(404).send({ status: "error", message: `User with ID ${id} not found` });

    return res.status(200).send({ status: "success", data: user });
  },
]);

router.delete("/:id", [admin, me, validateObjectId], async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);

  if (!user)
    return res.status(404).send({ status: "error", message: `User with ID ${id} not found` });

  return res.status(202).send({ status: "success", message: `User with ID ${id} deleted.` });
});

export default router;
