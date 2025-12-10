import { Router } from "express";
import { ProfileController } from "./profile.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/profile/:id", authenticate, ProfileController.getProfileById);
router.put("/update-profile/:id", authenticate, ProfileController.updateProfileById);

export default router;
