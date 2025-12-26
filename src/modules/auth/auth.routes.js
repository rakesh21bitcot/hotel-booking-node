import { Router } from "express";
import { signinScheama, signupSchema, changePasswordSchema, resetPasswordSchema } from "./auth.validation.js";
import { AuthController } from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const err = new Error(error.details.map((d) => d.message).join(", "));
      err.name = "ValidationError";
      err.status = 422;
      return next(err);
    }
    return next();
  };
}

router.post("/signup", validate(signupSchema), AuthController.signup);
router.post("/signin", validate(signinScheama), AuthController.signin);

// Forgot Password route
router.post("/forgot-password", AuthController.forgotPassword);

// Reset Password route
router.post("/reset-password", validate(resetPasswordSchema), AuthController.resetPassword);

// Change Password route
router.post("/change-password", authenticate, validate(changePasswordSchema), AuthController.changePassword);

router.post("/logout", AuthController.logout);

export default router;
