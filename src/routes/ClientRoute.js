
const express = require("express");
const { Router } = require("express");
const clientRoute = Router();
const passport = require("passport");
const upload = require("../middleware/multer");
const validation = require("../middleware/validationMiddleware");

const clientValidationSchema = require("../validation/registerSchema");
const { 
    registerClient ,
    login ,
    forgotPassword,
    resetPassword ,
    getClientList , 
    getClientById , 
    deleteClientById , 
    verifyOtp,
    searchClient
} = require("../controller/client.controller");



//only admin can access this route with its _id
clientRoute.route("/client/register").post( 
    passport.authenticate("jwt", { session: false }) ,   //auth middleware
    //validation(clientValidationSchema),                 //joi validation middleware
    upload.fields([                                    //multer middleware
        { name: 'profileImage', maxCount: 1 },
        {name: 'companyLogo' , maxCount: 1},
        {name: 'GstCertificate' , maxCount: 1}
    ]),
    registerClient
);

clientRoute.route("/client/login").post(login);

//this is non auth route
clientRoute.route("/client/forgotpassword/").post(
    forgotPassword
);

//this is non auth route
clientRoute.route("/client/resetpassword/").post(
    // passport.authenticate("jwt" , {session:false}) , 
    resetPassword
);

clientRoute.route("/client/search").get(
    passport.authenticate("jwt", { session: false }), 
    searchClient
);

clientRoute.route("/client/get/:id").get(
    passport.authenticate("jwt", { session: false }), 
    getClientById
);

clientRoute.route("/client/get/client/all").get(
    passport.authenticate("jwt", { session: false }), 
    getClientList
);



clientRoute.route("/client/verify/otp").post(
    // passport.authenticate("jwt", { session: false }), 
    verifyOtp
)

//delete client by id
clientRoute.route("/client/delete/:id").delete(
    passport.authenticate("jwt", { session: false }), 
    deleteClientById
);





module.exports = clientRoute;