import mongoose from "mongoose";
import Joi from "joi";
import uniqueValidator from "mongoose-unique-validator";

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 50,
      unique: true,
      lowercase: true,
      trim: true,
    },
    backgroundColor: { type: String, required: true, maxlength: 8 },
    textBlack: { type: Boolean, default: true },
    image: { type: String, maxlength: 250 },
    description: { type: String, minlength: 10, maxlength: 255 },
    __v: { type: Number, select: false },
  },
  { timestamps: true }
);

tagSchema.plugin(uniqueValidator, { message: "should be unique." });

const Tag = mongoose.model("Tag", tagSchema);

const validateTag = (tag, options) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(50).required().label("Name").trim().lowercase(),
    backgroundColor: Joi.string().required().max(8).label("Background Color").trim(),
    textBlack: Joi.boolean(),
    image: Joi.string().uri().max(250).label("Image").trim(),
    description: Joi.string().min(10).max(255).trim().label("Description"),
  });

  return schema.validate(tag, options);
};

const validatePatchTag = (tag, options) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(50).label("Name").trim().lowercase(),
    backgroundColor: Joi.string().max(8).label("Background Color").trim(),
    textBlack: Joi.boolean(),
    image: Joi.string().uri().max(250).label("Image").trim(),
    description: Joi.string().min(10).max(255).trim().label("Description"),
  });

  return schema.validate(tag, options);
};

export { Tag, tagSchema, validateTag, validatePatchTag };
