import mongoose from "mongoose";
import Joi from "joi";
import referrenceValidator from "mongoose-referrence-validator";

const followerUserSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    followerUserId: { type: [mongoose.Schema.Types.ObjectId], ref: "User", required: true },
  },
  { timestamps: true }
);

followerUserSchema.plugin(referrenceValidator);
followerUserSchema.index({ followerUserId: 1, userId: 1 }, { unique: true });

const validateFollowerUser = (data, options) => {
  const schema = Joi.object({
    // userId: Joi.objectId().required(),
    followerUserId: Joi.objectId().required(),
  });

  return schema.validate(data, options);
};

const followerUser = mongoose.model("FollowerUser", followerUserSchema);

export { followerUser, followerUserSchema, validateFollowerUser };
