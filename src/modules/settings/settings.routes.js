import { Router } from "express";
import { SettingsController } from "./settings.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/settings", authenticate, SettingsController.getSettings);
router.put("/settings", authenticate, SettingsController.updateSettings);

export default router;
