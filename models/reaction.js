import mongoose from "mongoose";
import Joi from "joi";
import referrenceValidator from "mongoose-referrence-validator";

const reactionSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: [mongoose.Schema.Types.ObjectId], ref: "User", required: true },
  },
  { timestamps: true }
);

reactionSchema.plugin(referrenceValidator);
reactionSchema.index({ userId: 1, postId: 1 }, { unique: true });

const validateReaction = (data, options) => {
  const schema = Joi.object({
    postId: Joi.objectId().required(),
    userId: Joi.objectId().required(),
  });

  return schema.validate(data, options);
};

const Reaction = mongoose.model("Reaction", reactionSchema);

export { Reaction, reactionSchema, validateReaction };
