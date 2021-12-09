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
    },
    backgroundColor: {
      type: String,
      required: true,
      maxlength: 8,
    },
    textBlack: {
      type: Boolean,
      default: true,
    },
    __v: { type: Number, select: false },
  },
  { timestamps: true }
);

tagSchema.plugin(uniqueValidator, { message: "should be unique." });

const Tag = mongoose.model("Tag", tagSchema);

const validateTag = (tag, options) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(50).required().label("Name"),
    backgroundColor: Joi.string().required().max(8).label("Background Color"),
    textBlack: Joi.boolean(),
  });

  return schema.validate(tag, options);
};

export { Tag, tagSchema, validateTag };
