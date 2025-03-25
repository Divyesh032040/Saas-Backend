const Joi = require("joi");

const clientValidationSchema = Joi.object({
  
  roll: Joi.string().valid("admin", "client", "superAdmin").required(),

  customerName: Joi.string().trim().required(),

  companyName: Joi.string().trim().required(),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required(),

  password: Joi.string().min(6).required(), 

  phone: Joi.string()
    .pattern(/^\d{10,15}$/)
    .message("Please enter a valid phone number")
    .required(),

  mobile: Joi.string()
    .pattern(/^\d{10,15}$/)
    .message("Please enter a valid mobile number")
    .required(),

  whatsappNumber: Joi.string()
    .pattern(/^\d{10,15}$/)
    .message("Please enter a valid WhatsApp number")
    .required(),

  profileImage: Joi.string().trim().optional().allow(""),

  companyLogo: Joi.string().trim().optional().allow(""),

  addresses: Joi.array()
    .items(
      Joi.object({
        addressType: Joi.string()
          .valid("shipping", "billing", "home", "office")
          .required(),
        address: Joi.string().required(),
        zipcode: Joi.number().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        country: Joi.string().required(),
      })
    )
    .optional(),

  subscription: Joi.string().optional().allow(null), // Assuming it's an ObjectId, validate it separately if needed

  PANNumber: Joi.string().trim().required(),

  GstCertificate: Joi.string().trim().optional().allow(""),

  jobPosition: Joi.string().trim().required(),

  GstTreatment: Joi.array().items(
    Joi.object({
      GstTreatment:Joi.string().required()
    })
  ),

  tax: Joi.number().min(0).required(),

  defectDiscount: Joi.number().min(0).max(100).required(),
});

module.exports = clientValidationSchema;
