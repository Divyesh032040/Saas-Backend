
const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string()
    .email() 
    .required()
    .trim()
    .messages({
      "string.email": "Invalid email format",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),

    password: Joi.string().required().messages({
      "string.empty": "Password is required",
      "any.required": "Password is required",
    })
    
});

module.exports =  loginSchema;
