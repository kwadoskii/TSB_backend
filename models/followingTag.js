import mongoose from "mongoose";
import Joi from "joi";
import referrenceValidator from "mongoose-referrence-validator";

const followingTagSchema = new mongoose.Schema(
  {
    tagId: { type: [mongoose.Schema.Types.ObjectId], ref: "Tag", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

followingTagSchema.plugin(referrenceValidator);
followingTagSchema.index({ tagId: 1, userId: 1 }, { unique: true });

const validateFollowingTag = (data, options) => {
  const schema = Joi.object({
    tagId: Joi.objectId().required(),
    userId: Joi.objectId().required(),
  });

  return schema.validate(data, options);
};

const followingTag = mongoose.model("FollowingTag", followingTagSchema);

export { followingTag, followingTagSchema, validateFollowingTag };
