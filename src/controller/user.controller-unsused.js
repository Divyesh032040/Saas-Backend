const {  
    generateAccessToken,
    generateRefreshToken, 
    verifyToken , 
    deleteToken , 
    updateRefreshToken , 
    tokenWithExpiry
} = require("../services/authService");
const bcrypt = require("bcryptjs");
const CreateService = require("../services/CreateServices");
const UserService = CreateService('User');
const userService = require("../services/userService");  //custom
const User = require("../Model/client.model");
const logger = require("../logger");
const {isValidObjectId} = require("mongoose");
const fs = require("fs");
const path = require("path")
const sendEmail = require("../services/emailService");


// Utility function for email validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

//API ENDPOINT CONTROLLERS


// Register User (Signup)
const register = async (req, res) => {
    try {
        const { email, password, name , roll } = req.body;

        // Validate input manually
        if (!email || !password || !name || !roll) {
            return res.status(400).json({
                success: false,
                message: "Email, password, and name are required.",
            });
        }

        // Check if email is valid
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format.",
            });
        }

        // Check if password is strong enough (example: at least 6 characters)
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long.",
            });
        }

        // Check if user already exists
        const existingUser = await userService.findUser({ email });
        if (existingUser) {
            return res.status(409).json({
                status: false,
                message: "User with this email is already registered.",
            });
        }

        // Encrypt password
        const encryptedPassword = userService.encryption(password);

        //profile path in database
        const profilePath = req.files.profile[0].path


        // Create user
        const newUser = await userService.createUser({
            payload: { name, email, password: encryptedPassword , roll , profile : profilePath},
        });

        // Respond with success
        return res.status(201).json({
            status: true,
            message: "User registered successfully.",
            data: {
                name: newUser.name,
                email: newUser.email,
                _id: newUser._id,
                roll: newUser.roll,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt,
            },
        });
    } catch (error) {
        // Log the error
        logger.error("Error during user registration:", error);

        return res.status(500).json({
            status: false,
            message: "Failed to register user. Please try again later.",
        });
    }
};


// Login User
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user by email
        const user = await userService.findUser({ email });

        if (!user) {
            return res.status(400).json({ status:false , message: "Invalid email or user not found" });
        }

        // Validate password
        const passwordMatch = await userService.passwordValidate(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ status:false , message: "Invalid password" });
        }

        // Generate Tokens
        let accessToken, refreshToken;
        try {
            accessToken = generateAccessToken({ id: user._id, email });
            refreshToken = generateRefreshToken({ id: user._id, email });
        } catch (tokenError) {
            logger.error("Token generation error:", tokenError);
            return res.status(500).json({ message: "Failed to generate tokens" });
        }


        // Send success response
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                email:user.email,
                _id:user._id,
                tokens: { accessToken, refreshToken }
            },
            
        });

    } catch (error) {
        logger.error("Unexpected Error in login:", error);
        return res.status(500).json({ message: "Failed to login user | INTERNAL SERVER ERROR" });
    }
};

//delete userById
const deleteUser = async (req, res) => {
    try {

        const {userid} = req.params;
        
        if(!isValidObjectId(userid)){
            return res.status(400).json({
                message : "invalid userId"
            })
        }

        //find user in database
        const dbUser = await UserService.findById(userid);

        if(dbUser.data._id.toString() != userid.toString()){
            return res.status(400).json({message:"only account owner can delete a message"});
        }
        // console.log(dbUser.data._id.toString() ,  userid.toString())

        const response = await UserService.deleteById(userid);

        // console.log(response)

        if(!response){
            return res.status(500).json({
                message:"Fail to delete a userData"
            })
        }

        // //delete a profile picture 
        // const profile = dbUser.data.profile;
        // const filePath = path.join(__dirname, profile.replace(/\\/g, path.sep));

        // const res = fs.unlink(filePath, (err) => {
        //     if (err) {
        //         console.error('Error deleting file:', err);
        //     } else {
        //         console.log('Profile picture deleted successfully');
        //     }
        // });

        // if(!res){
        //     return res.status(500).json({
        //         message:"Fail to delete a profile picture"
        //     })
        // }

        return res.status(200).json({
            status:true,
            message:"user Deleted successfully",
            data : {
                name:response.name,
                _id:response._id,
                email:response.email,
            }
        })

    } catch (error) {
        logger.error("Failed to delete user", error);
        return res.status(500).json({ message: "Failed to delete user data" });
    }
};


//getUserList
const getUserList = async (req, res) => {
    try {
        // Extract and validate query parameters
        let { email, page = 1, limit = 10 , name } = req.query;
        
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        
        if (page < 1 || limit < 1) {
            return res.status(400).json({ status: false, message: "Invalid pagination parameters" });
        }

        // Construct search query dynamically
        let query = {};
        if (email) {
            query.email = { $regex: email, $options: "i" }; // Case-insensitive search
        }

        if(name){
            query.name = { $regex: name, $options: "i" }
        }

        // Pagination calculations
        const start = (page - 1) * limit;

        // Query parameters
        const params = {
            query,
            sort: { createdAt: -1 },
            start,
            limit,
            display: ["name" , "email"],
        };

        logger.info(`Fetching user list with params: ${JSON.stringify(params)}`);

        // Fetch data from UserService
        const result = await UserService.find(params);

        if (!result?.status) {
            logger.error("Failed to fetch user list", { error: result?.error });
            return res.status(500).json({ status: false, message: "Error fetching users", error: result?.error });
        }

        return res.json({
            status: true,
            message : "user fetched successfully",
            data : {
                users: result.data || [],
                totalUsers: result.count || 0,
                totalPages: result.totalPages || Math.ceil((result.count || 0) / limit),
                currentPage: page,
            }
        });

    } catch (error) {
        logger.error("Unexpected error in getUserList", { error: error.message });
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


//updateUserData
const updateUser = async (req, res) => {
    try {
        const { email, name } = req.body;
        const userData = req.user;

        // Check for unauthorized access
        if (!userData) {
            return res.status(401).json({ status:false , message: "Unauthorized request" });
        }

        // Validate input
        if (!email && !name) {
            return res.status(400).json({ status:false , message: "Please provide at least one value to update" });
        }

        if (email && !validateEmail(email)) {
            return res.status(400).json({status:false , message: "Invalid email format" });
        }
        
        const updatedUser = await UserService.updateById( userData._id , { name, email })
        

        if (!updatedUser) {
            logger.error("Failed to update user data for ID: ", userData._id);
            return res.status(500).json({ message: "Failed to update user data" });
        }

        const response = {
            _id : updatedUser.data._id ,
            name : updatedUser.data.name ,
            email : updatedUser.data.email ,
            createdAt : updatedUser.data.createdAt,
            updatedAt : updatedUser.data.updatedAt
        }

        // Return success response
        return res.status(200).json({
            status:true,
            message: "User data updated successfully",
            data: response,
        });
    } catch (error) {
        logger.error("Error in updateUser: ", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// Forgot Password Controller
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
      //Validate email
      const user = await userService.findUser({ email });
      
      const userData = req.user;

      if (!user) {
        return res.status(400).json({
          message: 'If this email exists, you will receive a reset link.',
          status:false
        });
      }
  
      //generate reset token with 60 minutes expiration
        const resetToken = await tokenWithExpiry({email : user?.email , _id: user?._id });
  

      //Send reset email with token link
        const resetLink = `http://${process.env.HOST}:3000/api/v1/user/resetpassword?token=${resetToken}`;
        const senderEmail = user?.email;
        const subject = 'Password Reset Request'

        const response = await sendEmail (senderEmail , subject , resetLink);
  
      // respond to the user
      res.status(200).json({
        status:true,
        message: 'Password reset link sent to your email address.',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status:false,
        message: 'An error occurred. Please try again later.',
      });
    }
};


//reset password
const resetPassword = async(req , res) => {
    const { newPassword, confirmPassword , token } = req.body;

    if(!token){
        return res.status(400).json({status : false , message : "unAuthorized request"});
    }

    const decoded = verifyToken(token);

    if(!decoded){
        logger.error("fail to decode a reset password token")
        return res.json({ status : false , message : "fail to decode password reset token"})
    }

    const user = await UserService.findById(decoded?._id);  //access via user.data 

    //verify token payload id with user id
    if (!user.data || user.data.email !== decoded?.email) {
        return res.status(400).json({ message: 'Invalid or expired token.' });
    }


    if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const hashedPassword = userService.encryption(newPassword);

    if(! hashedPassword){
        logger.error("fail to encryption of new user password")
        return res.status(500).json({message:"fail to encryption of new password"})
    }

    const updatedUser = await UserService.updateById( user._id , {password : hashedPassword} , {new:true})


    res.status(200).json({
        status : true ,
        message: 'Password reset successful.',
    });

}


// module.exports = { login, register , deleteUser , getUserList , updateUser , forgotPassword , resetPassword};
