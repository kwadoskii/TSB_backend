import mongoose from "mongoose";
import Joi from "joi";
import referrenceValidator from "mongoose-referrence-validator";

const followingUserSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    followingUserId: { type: [mongoose.Schema.Types.ObjectId], ref: "User", required: true },
  },
  { timestamps: true }
);

followingUserSchema.plugin(referrenceValidator);
followingUserSchema.index({ followingUserId: 1, userId: 1 }, { unique: true });

const validateFollowingUser = (data, options) => {
  const schema = Joi.object({
    userId: Joi.objectId().required(),
    followingUserId: Joi.objectId().required(),
  });

  return schema.validate(data, options);
};

const followingUser = mongoose.model("FollowingUser", followingUserSchema);

export { followingUser, followingUserSchema, validateFollowingUser };
