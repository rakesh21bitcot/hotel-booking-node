import Joi from "joi";

export const signupSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(120).required(),
});

export const signinScheama = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(120).required(),
});