import { Router } from "express";
import { UserController } from "./user.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/users", authenticate , UserController.getAllUsers);
router.get("/user/:id", authenticate , UserController.getUsersbyId);
router.delete("/user/:id", authenticate , UserController.userDeletebyId);
router.put("/user/:id", authenticate, UserController.userUpdateById);


export default router;
