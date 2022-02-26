import mongoose from "mongoose";
import Joi from "joi";
import uniqueValidator from "mongoose-unique-validator";
import jwt from "jsonwebtoken";

const userShema = new mongoose.Schema(
  {
    firstname: { type: String, required: true, minlength: 2, maxlength: 255 },
    middlename: { type: String, minlength: 2, maxlength: 255 },
    lastname: { type: String, required: true, minlength: 2, maxlength: 255 },
    username: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
      unique: true,
      lowercase: true,
    },
    email: { type: String, required: true, minlength: 5, maxlength: 512, unique: true },
    password: { type: String, required: true, minlength: 2, maxlength: 1024 },
    bio: { type: String, minlength: 2, maxlength: 1024 },
    gender: { type: String, enum: ["F", "M"], required: true },
    profileImage: {
      type: String,
      maxlength: 250,
      default: "https://www.shareicon.net/data/512x512/2016/07/26/802043_man_512x512.png",
    },
    location: { type: String, minlength: 2, maxlength: 50 },
    website: { type: String, maxlength: 100 },
    occupation: {
      position: { type: String, maxlength: 100 },
      company: { type: String, maxlength: 100 },
      website: { type: String, maxlength: 100 },
    },
    education: { type: String, maxlength: 100 },
    joined: { type: Date, default: new Date() },
    displayEmail: { type: Boolean, default: true },
    displayWebsite: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userShema.plugin(uniqueValidator, { message: "should be unique." });

userShema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      firstname: this.firstname,
      middlename: this.middlename,
      lastname: this.lastname,
      username: this.username,
      profileImage: this.profileImage,
      // isAdmin: this.isAdmin,
    },
    process.env.JWT_PRIVATE_KEY,
    { expiresIn: "30d", issuer: "TSB" }
  );

  return token;
};

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
    gender: Joi.string().label("Gender").trim().required().valid("F", "M"),
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
    isAdmin: Joi.boolean().label("Is Admin"),
  });

  return schema.validate(user, options);
};

const validatePatchUser = (user, options) => {
  const schema = Joi.object({
    firstname: Joi.string().min(2).max(255).label("Firstname").trim(),
    middlename: Joi.string().min(2).max(255).trim().allow(null).label("Middlename"),
    lastname: Joi.string().min(2).max(255).label("Lastname").trim(),
    username: Joi.string().min(5).max(255).label("Username").trim().lowercase(),
    email: Joi.string().min(5).max(512).trim().email().label("Email"),
    password: Joi.string().min(2).max(1024).label("Password").trim(),
    bio: Joi.string().min(2).max(1024).trim().label("Bio").trim(),
    gender: Joi.string().label("Gender").trim(),
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
    isAdmin: Joi.boolean().label("Is Admin"),
  });

  return schema.validate(user, options);
};

const validateAuth = (data, options) => {
  const schema = Joi.object({
    username: [
      Joi.string().min(5).max(255).label("Username").trim(),
      Joi.string().min(5).max(512).trim().email().label("Email"),
    ],
    password: Joi.string().min(2).max(1024).label("Password").trim(),
  });

  return schema.validate(data, options);
};

export { User, userShema, validatePatchUser, validateUser, validateAuth };
