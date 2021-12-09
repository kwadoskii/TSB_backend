import express from "express";

const router = express.Router();

const status = router.get("/", (_, res) => {
  return res.status(200).json({
    status: "success",
    data: { message: "TSB servers up and running", timestamp: new Date() },
  });
});

export default status;
