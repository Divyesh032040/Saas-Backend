const { Router } = require("express");
const subscriptionMasterRouter = Router();   
const validation = require("../middleware/validationMiddleware");
const passport = require("passport");
const upload= require("../middleware/multer");
const { createSubscription , 
        getAllSubscription , 
        updateSubscription ,
        updateService ,
        deleteSubscription
    } = require("../controller/subscriptionMaster.controller");
const {subscriptionMasterSchema, 
        updateSubscriptionSchema,
        updateServiceSchema ,
    } = require("../validation/subscriptionMaster")




subscriptionMasterRouter.route("/subscription/master/create").post(
    validation(subscriptionMasterSchema) ,
    passport.authenticate("jwt", { session: false }),createSubscription );

subscriptionMasterRouter.route("/subscription/master/get").get(
    passport.authenticate("jwt", { session: false }), 
    getAllSubscription);

subscriptionMasterRouter.route("/subscription/master/update/:id").patch(
    validation(updateSubscriptionSchema),
    passport.authenticate("jwt", { session: false }), 
    updateSubscription);


subscriptionMasterRouter.route("/subscription/master/update/service/:id").patch(
    validation(updateServiceSchema),
    passport.authenticate("jwt", { session: false }), 
    updateService);



subscriptionMasterRouter.route("/subscription/master/delete/:id").delete(
    passport.authenticate("jwt", { session: false }), 
    deleteSubscription);












module.exports = subscriptionMasterRouter;

