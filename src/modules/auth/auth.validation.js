import Joi from "joi";

export const signupSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(120).required(),
    confirmPassword: Joi.any().equal(Joi.ref('password')).required().label('Confirm password'),
});

export const signinScheama = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(120).required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.any().equal(Joi.ref('newPassword')).required().label('Confirm password'),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).max(120).required(),
});