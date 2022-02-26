import mongoose from "mongoose";
import Joi from "joi";
import referrenceValidator from "mongoose-referrence-validator";
import mongooseUniqueValidator from "mongoose-unique-validator";

const commentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true, maxlength: 2500 },
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
  },
  { timestamps: true }
);

commentSchema.plugin(referrenceValidator);

const Comment = mongoose.model("Comment", commentSchema);

const validateComment = (data, options) => {
  const schema = Joi.object({
    postId: Joi.objectId().required(),
    comment: Joi.string().required().max(2500).label("Comment").trim(),
    likes: Joi.array().items(Joi.objectId()),
  });

  return schema.validate(data, options);
};

const validateCommentLike = (data, options) => {
  const schema = Joi.object({
    userId: Joi.objectId().required(),
    commentId: Joi.objectId().required(),
  });

  return schema.validate(data, options);
};

export { commentSchema, Comment, validateComment, validateCommentLike };
