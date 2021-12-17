import express from "express";

import statusController from "../controllers/statusController.js";

const router = express.Router();

router.get("/", statusController.status);

export default router;
