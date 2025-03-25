// const { Router } = require("express");
// const loginSchema = require("../validation/Schemas/clientSchema/loginSchema");
// const { login, register, getUserList, deleteUser , updateUser , forgotPassword , resetPassword} = require("../controller/user.controller");
// const validation = require("../validation/validationMiddleware");
// const passport = require("passport");
// const upload= require("../middleware/multer");

// const userRouter = Router();

// // User registration route
// userRouter.route("/user/register").post(
//     upload.fields([
//         { name: 'profileImage', maxCount: 1 },
//         {name: 'companyLogo' , maxCount: 1}
//     ]) ,
//     register);


// userRouter.route("/user/login").post(validation(loginSchema), login);

// userRouter.route("/user/getuserlist").get(passport.authenticate("jwt", { session: false }), getUserList);

// // Update user (protected route with JWT authentication)
// userRouter.route("/user/delete/:userid").delete(passport.authenticate("jwt", { session: false }), deleteUser);

// userRouter.route("/user/update").patch(passport.authenticate("jwt", { session: false }), updateUser);

// userRouter.route("/user/forgotpassword").post(passport.authenticate("jwt" , {session:false}) , forgotPassword);

// userRouter.route("/user/resetpassword").post(passport.authenticate("jwt" , {session:false}) , resetPassword);

// module.exports = userRouter;

