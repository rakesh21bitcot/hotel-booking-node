import { Router } from "express";
import { signinScheama, signupSchema, changePasswordSchema } from "./auth.validation.js";
import { AuthController } from "./auth.controller.js";

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
router.post("/reset-password", AuthController.resetPassword);

// Change Password route
router.post("/change-password", validate(changePasswordSchema), AuthController.changePassword);

router.post("/logout", AuthController.logout);

export default router;
