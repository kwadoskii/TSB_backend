import mongoose from "mongoose";
import Joi from "joi";
import referrenceValidator from "mongoose-referrence-validator";

const savedPostSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    userId: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
        savedDate: { type: Date, default: new Date() },
      },
    ],
  },
  { timestamps: true }
);

savedPostSchema.plugin(referrenceValidator);
savedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });

const validateSavedPost = (data, options) => {
  const schema = Joi.object({
    postId: Joi.objectId().required(),
    userId: Joi.objectId().required(),
  });

  return schema.validate(data, options);
};

const SavedPost = mongoose.model("SavedPost", savedPostSchema);

export { SavedPost, savedPostSchema, validateSavedPost };
