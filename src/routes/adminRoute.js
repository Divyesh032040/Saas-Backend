
const express = require("express");
const { Router } = require("express");
const adminRoute = Router();
const passport = require("passport");
const upload = require("../middleware/multer");
const validation = require("../middleware/validationMiddleware");
const clientValidationSchema = require("../validation/registerSchema");
const loginSchema = require("../validation/loginSchema")
const { 
    registerAdmin ,
    adminLogin , 
    deleteAdmin , 
    getState , 
    getCountry
} = require("../controller/admin.controller");



//only logged in admin can register client
adminRoute.route("/admin/register/").post( 
    // passport.authenticate("jwt", { session: false }),   
    //validation(clientValidationSchema),                 //joi validation middleware
    upload.fields([                                    //multer middleware
        { name: 'profileImage', maxCount: 1 },
        {name: 'companyLogo' , maxCount: 1},
        {name: 'GstCertificate' , maxCount: 1}
    ]),
    registerAdmin
);

adminRoute.route("/admin/login/").post(
    // validation(loginSchema),
    adminLogin
)

adminRoute.route("/admin/delete").delete(
    passport.authenticate("jwt", { session: false }),
    deleteAdmin
)

adminRoute.route("/admin/address/state/").get( 
    passport.authenticate("jwt", { session: false }),
    getState
);

adminRoute.route("/admin/address/country").get(
    passport.authenticate("jwt", { session: false }),
    getCountry
)









module.exports = adminRoute;