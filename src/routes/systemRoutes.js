import { Router } from "express";
import {
  getApiIndex,
  getCPUInfo,
  getHealth,
  getMemoryInfo,
  getMonitorDetails,
  getNetworkDetails,
  getOSInfo,
  getProcessDetails,
  getRoot,
  getStats,
  getUserDetails,
  triggerLeak,
} from "../controllers/systemController.js";

const router = Router();

router.get("/", getRoot);
router.get("/api", getApiIndex);
router.get("/cpu", getCPUInfo);
router.get("/memory", getMemoryInfo);
router.get("/os", getOSInfo);
router.get("/user", getUserDetails);
router.get("/network", getNetworkDetails);
router.get("/process", getProcessDetails);
router.get("/monitor", getMonitorDetails);
router.get("/stats", getStats);
router.get("/health", getHealth);
router.get("/leak", triggerLeak);

export default router;
