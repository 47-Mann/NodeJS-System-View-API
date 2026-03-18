import { Router } from "express";
import {
  getHealth,
  getMonitorDetails,
  getRoot,
  getStats,
} from "../controllers/systemController.js";

const router = Router();

router.get("/", getRoot);
router.get("/monitor", getMonitorDetails);
router.get("/stats", getStats);
router.get("/health", getHealth);

export default router;
