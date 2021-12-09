import mongoose from "mongoose";

export default () => {
  const DB_URI = process.env.DB_URI;
  const options = { useNewUrlParser: true, useUnifiedTopology: true };

  mongoose.connect(DB_URI, options).then(() => console.log("Connected to database successfully"));
};
