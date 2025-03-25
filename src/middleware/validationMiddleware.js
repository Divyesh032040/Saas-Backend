const joi = require('joi');

const validation = (schema) => {
    return (req, res, next) => {
        
        if (!schema || typeof schema.validate !== 'function') {
            console.error("Invalid Joi schema provided to validation middleware.");
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error: Invalid validation schema.",
            });
        }

        const options = {
            abortEarly: true,  
            allowUnknown: true, 
            stripUnknown: true  
        };

        const { error, value } = schema.validate(req.body, options);

        if (error) {
            console.log(error);
            return res.status(400).json({
                status: "error",
                message: "Validation failed",
                details: error.details.map(err => err.message)
            });
            
        }
        req.body = value; 
        next();
    };
};

module.exports = validation;