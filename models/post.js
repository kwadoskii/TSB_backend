import Joi from "joi";
import mongoose from "mongoose";
import referrenceValidator from "mongoose-referrence-validator";
import mongooseUniqueValidator from "mongoose-unique-validator";

const postSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true },
    title: { type: String, required: true, maxlength: 80 },
    tags: { type: [mongoose.Schema.Types.ObjectId], ref: "Tag", required: true },
    content: { type: String, required: true },
    banner: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    views: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// postSchema.plugin(referrenceValidator);
postSchema.plugin(mongooseUniqueValidator, { message: "should be unique." });

const Post = mongoose.model("Post", postSchema);

const validatePost = (post, options) => {
  const schema = Joi.object({
    title: Joi.string().max(80).trim().required(),
    tags: Joi.array().max(4).min(1).items(Joi.objectId()),
    content: Joi.string().required().trim(),
    banner: Joi.string().trim().uri({ allowRelative: true }),
    // author: Joi.objectId().required(),
  });

  return schema.validate(post, options);
};

const validatePostPatch = (post, options) => {
  const schema = Joi.object({
    title: Joi.string().max(80).trim(),
    tags: Joi.array().max(4).min(1).items(Joi.objectId()),
    content: Joi.string().trim(),
    banner: Joi.string().trim().uri({ allowRelative: true }),
    // author: Joi.objectId(),
  });

  return schema.validate(post, options);
};

export { postSchema, Post, validatePost, validatePostPatch };
