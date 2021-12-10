import mongoose from "mongoose";
import Joi from "joi";
import uniqueValidator from "mongoose-unique-validator";

const userShema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    middlename: {
      type: String,
      minlength: 2,
      maxlength: 255,
    },
    lastname: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    username: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 512,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 1024,
    },
    bio: {
      type: String,
      minlength: 2,
      maxlength: 1024,
    },
    profileImage: {
      type: String,
      maxlength: 250,
    },
    location: {
      type: String,
      minlength: 2,
      maxlength: 50,
    },
    website: {
      type: String,
      maxlength: 100,
    },
    occupation: {
      position: {
        type: String,
        maxlength: 100,
      },
      company: {
        type: String,
        maxlength: 100,
      },
      website: {
        type: String,
        maxlength: 100,
      },
    },
    education: {
      type: String,
      maxlength: 100,
    },
    joined: {
      type: Date,
      default: new Date(),
    },
    displayEmail: {
      type: Boolean,
      default: true,
    },
    displayWebsite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userShema.plugin(uniqueValidator, { message: "should be unique." });

const User = mongoose.model("User", userShema);

const validateUser = (user, options) => {
  const schema = Joi.object({
    firstname: Joi.string().min(2).max(255).required().label("Firstname").trim(),
    middlename: Joi.string().min(2).max(255).trim().label("Middlename"),
    lastname: Joi.string().required().min(2).max(255).label("Lastname").trim(),
    username: Joi.string().required().min(5).max(255).label("Username").trim().lowercase(),
    email: Joi.string().required().min(5).max(512).trim().email().label("Email"),
    password: Joi.string().required().min(2).max(1024).label("Password").trim(),
    bio: Joi.string().min(2).max(1024).trim().label("Bio").trim(),
    profileImage: Joi.string().uri().max(250).label("Profile Image").trim(),
    location: Joi.string().max(50).trim(),
    website: Joi.string().uri().max(100).trim().uri({ allowRelative: true }).allow(""),
    occupation: {
      position: Joi.string().max(100).trim().allow(""),
      company: Joi.string().max(100).trim().allow(""),
      website: Joi.string().max(100).trim().allow("").uri({ allowRelative: true }),
    },
    education: Joi.string().min(2).max(100).label("Education").trim(),
    displayEmail: Joi.boolean().label("Display Email"),
    displayWebsite: Joi.boolean().label("Display Website"),
  });

  return schema.validate(user, options);
};

const validatePatchUser = (user, options) => {
  const schema = Joi.object({
    firstname: Joi.string().min(2).max(255).label("Firstname").trim(),
    middlename: Joi.string().min(2).max(255).trim().label("Middlename"),
    lastname: Joi.string().min(2).max(255).label("Lastname").trim(),
    username: Joi.string().min(5).max(255).label("Username").trim(),
    email: Joi.string().min(5).max(512).trim().email().label("Email"),
    password: Joi.string().min(2).max(1024).label("Password").trim(),
    bio: Joi.string().min(2).max(1024).trim().label("Bio").trim(),
    profileImage: Joi.string().uri().max(250).label("Profile Image").trim(),
    location: Joi.string().max(50).trim().allow(""),
    website: Joi.string().uri({ allowRelative: true }).max(100).trim().allow(""),
    occupation: {
      position: Joi.string().max(100).trim().allow(""),
      company: Joi.string().max(100).allow("").trim(),
      website: Joi.string().max(100).trim().allow("").uri({ allowRelative: true }),
    },
    education: Joi.string().max(100).label("Education").trim().allow(""),
    displayEmail: Joi.boolean().label("Display Email"),
    displayWebsite: Joi.boolean().label("Display Website"),
  });

  return schema.validate(user, options);
};

export { User, userShema, validatePatchUser, validateUser };
