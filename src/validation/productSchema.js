const Joi = require('joi');
const mongoose = require('mongoose');

// Custom validation for MongoDB ObjectId
const objectIdValidation = (value, helpers) => {

  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const productSchema = Joi.object({

  productName: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Product name is required",
    "string.min": "Product name must be at least 2 characters long",
    "string.max": "Product name must not exceed 100 characters",
  }),

  productActive: Joi.boolean().default(true),

  salesPrice: Joi.number().positive().precision(2).required().messages({
    "number.base": "Sales price must be a number",
    "number.positive": "Sales price must be a positive number",
    "any.required": "Sales price is required",
  }),



  HSNSACCode: Joi.string().trim().required().messages({
    "string.empty": "HSN/SAC code is required",
  }),

  productImage: Joi.string().uri().optional().messages({
    "string.uri": "Product image must be a valid URL",
  }),
});

module.exports = productSchema;
