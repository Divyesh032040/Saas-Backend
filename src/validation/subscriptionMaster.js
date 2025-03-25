const Joi = require("joi");

const subscriptionMasterSchema = Joi.object({
    plan: Joi.string().required(),
    duration: Joi.string().required(),
    price: Joi.string().required(),
    service: Joi.array().items(
        Joi.object({
            serviceName: Joi.string().required(),
            serviceDescription: Joi.string().optional()
        })
    ).optional()
});




const updateSubscriptionSchema = Joi.object({
    plan: Joi.string().optional(),
    service: Joi.array().items(
        Joi.object({
            serviceName: Joi.string().optional(),
            serviceDescription: Joi.string().optional()
        })
    ).optional(),
    duration: Joi.string().optional(),
    price: Joi.string().optional()
});


const serviceSchema = Joi.object({
    serviceName: Joi.string().required(),
    serviceDescription: Joi.string().required(),
});

const updateServiceSchema = Joi.array().items(serviceSchema).min(1);




module.exports = {subscriptionMasterSchema , updateSubscriptionSchema , updateServiceSchema};
