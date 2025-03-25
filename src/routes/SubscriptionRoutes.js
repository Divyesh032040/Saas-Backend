const { Router } = require("express");
const subscriptionRouter = Router();   
const validation = require("../middleware/validationMiddleware");
const passport = require("passport");
const upload= require("../middleware/multer");
const { 
    createSubscriptions 
    } = require("../controller/subscriptionController");

const {subscriptionMasterSchema, 
        updateSubscriptionSchema,
        updateServiceSchema ,
    } = require("../validation/subscriptionMaster")

subscriptionRouter.route("/subscription/create/:planid").post(
    passport.authenticate("jwt", { session: false }) , createSubscriptions );

    
module.exports = subscriptionRouter