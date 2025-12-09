import { Router } from "express";
import { SettingsController } from "./settings.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/settings", authenticate, SettingsController.getSettings);
router.get("/settings/:userId", authenticate, SettingsController.getSettings);
router.put("/settings", authenticate, SettingsController.updateSettings);
router.put("/settings/:userId", authenticate, SettingsController.updateSettings);

export default router;
