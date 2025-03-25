const {  
    generateAccessToken,
    generateRefreshToken, 
    verifyToken , 
    deleteToken , 
    updateRefreshToken , 
    tokenWithExpiry
} = require("../services/authService");
const mongoose = require("mongoose");
// const CreateService = require("../services/CreateServices");
// const orgService = CreateService("Client");
const logger = require("../logger");
const User = require("../Model/user.model"); 
const clientService = require("../services/clientService"); 
const OtpService = require("../services/otpService");
const sendEmail = require("../services/emailService");
const Client = require("../Model/client.model")
const {isValidObjectId} = require("mongoose");
const fs = require("fs");
const path = require("path");


// Controller function to register a new clint (only admin can access this)
const registerClient = async (req, res) => {
  try {

    const adminData = req.user;

    
    //admin check 
    if(!adminData.roll === 'admin'){
        return res.json({
            status:false,
            message:"unAuthenticate request | only log in admin can access this route"
        })
    }


    // Destructure the fields from the request body
    const {
        roll,
        customerName,
        companyName,
        email,
        password,
        phone,
        mobile,
        whatsappNumber,
        addresses,
        subscription,
        PANNumber,
        jobPosition,
        GstTreatment,
        tax,
        defectDiscount,
        
        
    } = req.body;

    //file handing


    // const {profileImage , companyLogo, GstCertificate } = req.files.path;

    const profileImage = req.files.profileImage[0].path;
    const companyLogo = req.files.companyLogo[0].path;  
    const GstCertificate = req.files.GstCertificate[0].path;

    // Check if user already exists
    const existingClient = await Client.find({email})

    //console.log(existingClient)

    if (existingClient[0]) {
        return res.status(400).json({ status:true , message: "Client with this email already exists" });
    }

    // Hash the password using bcrypt service 
    const hashedPassword = clientService.encryption(password);
    if(!hashedPassword){
        return res.status(500).json({ status:false , message:"Error while password hashing"})
    }

    let gstTreatmentData , addressData;
  
    gstTreatmentData = JSON.parse(req.body.GstTreatment);
    if (!Array.isArray(gstTreatmentData)) {
      return res.status(400).json({ error: "GstTreatment must be an array" });
    }

    addressData = JSON.parse(req.body.address);
    if(!Array.isArray(addressData)){
      return res.status(400).json({status : false , error : "address must be a an array of address"})
    }

    // Create new client
    const newClient = new Client({
        customerName,
        companyName,
        email,
        password: hashedPassword,
        phone,
        mobile,
        whatsappNumber,
        profileImage,
        companyLogo,
        addresses : addressData,
        subscription,
        PANNumber,
        GstCertificate,
        jobPosition,
        GstTreatment : gstTreatmentData,
        tax,
        defectDiscount,
        roll,
        adminId: adminData?._id
    });

    // Save the new client to the database
    const response = await newClient.save();

    await User.findByIdAndUpdate(adminData?._id, { $push: { clients: newClient._id } });

    // Send response
    res.status(201).json({
        status:true,
        message : "client successfully registered",
        data : response 
        });
  } catch (error) {
    logger.error("fail to register client" , error)
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};


const login = async (req, res) => {

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user by email
        const user = await Client.find({ email });
        
        if (!user) {
            return res.status(400).json({ status:false , message: "Invalid email or user not found" });
        }

        // Validate password
        const passwordMatch = await clientService.passwordValidate(password, user.password);

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

        const decoded = verifyToken(accessToken); 



        // Send success response
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data:{
              user : user ,
              tokens : { 
                accessToken , 
                refreshToken , 
                ExpiresAt :  decoded.exp
            }
            }      
        });

    } catch (error) {
        logger.error("Unexpected Error in login:", error);
        return res.status(500).json({ message: "Failed to login user | INTERNAL SERVER ERROR" });
    }
};



const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            status: false,
            message: "Email not provided",
        });
    }

    try {
        // Check for email in Client collection first
        let user = await Client.findOne({ email });

        // If not found in Client, check in User collection
        if (!user) {
            user = await User.findOne({ email });
        }

        // If email not found in either collection
        if (!user) {
            return res.status(400).json({
                status: false,
                message: "This email is not registered with us",
            });
        }

        // Generate OTP
        const otp = OtpService.OtpGenerate();
        if (!otp) {
            logger.error("Failed to generate OTP");
            return res.status(500).json({
                status: false,
                message: "Failed to generate OTP",
            });
        }

        // Set OTP expiry time (5 minutes)
        const time = 1000 * 60 * 5; 
        const expire = Date.now() + time;
        const data = `${email}.${otp}.${expire}`;

        // Hash the OTP
        const hashedOtpToSend = OtpService.hashOtp(data);
        const senderEmail = user.email;
        const subject = "Password Reset Request";

        // Send OTP via email
        await sendEmail(senderEmail, subject, otp);

        // Respond to the user
        res.status(200).json({
            status: true,
            hash: `${hashedOtpToSend},${expire}`,
            email,
            message: "Password reset OTP sent to your email address.",
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: false,
            message: "An error occurred. Please try again later.",
        });
    }
};


const verifyOtp = async(req , res) => {
try {
        const { hash, otp, email } = req.body;

            //for development phase only 
            if(otp === "0320"){
                return res.status(200).json({
                    status:true,
                    message : "password verified successfully",
                    auth:true
                });
            }
    
            if (!hash || !email || !otp) {
                return res.status(400).json({ message: "not Provide OTP" });
            }
    
            const [hashedOtp, expire] = hash.split(',');

    
            if (Date.now() > +expire) {
                return res.status(400).json({ message: "OTP Expired" });
            }
    
            const data = `${email}.${otp}.${expire}`;
            const isValid = OtpService.verifyOtp(hashedOtp, data);
    
            if (!isValid) {
                return res.status(400).send("Invalid OTP");
            }
    
            return res.status(200).json({
                status:true,
                message : "password verified successfully",
                auth:true
            });
    } catch (error) {
        logger.error(error);
        res.status(500).json({
        status:false,
        message: 'An error occurred in verify opt.',
        });
    }
}


const resetPassword = async(req , res) => {
    const { newPassword, confirmPassword } = req.body;
    const {email} = req.body;

    if(!email){
        return res.status(500).json({
            status:false,
            message:"user Email is missing"
        })
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
        }


        // Check for email in Client collection first
        let user = await Client.findOne({ email });

        // If not found in Client, check in User collection
        if (!user) {
            user = await User.findOne({ email });
        }

        // If email not found in either collection
        if (!user) {
            return res.status(400).json({
                status: false,
                message: "This email is not registered with us",
            });
        }

    
    //verify token payload id with user id
    if (user.email !== email) {
        return res.status(400).json({ message: 'invalid email' });
    }

    const hashedPassword = clientService.encryption(newPassword);

    if(! hashedPassword){
        logger.error("fail to encryption of new user password")
        return res.status(500).json({message:"fail to encryption of new password"})
    }

    let response;
    if(user.roll === "client"){
        response = await Client.findByIdAndUpdate( user._id , {password : hashedPassword} , {new:true})
    }else if (user.roll === "admin" || "superadmin"){
        response = await User.findByIdAndUpdate( user._id , {password : hashedPassword} , {new:true})
    }

    res.status(200).json({
        status : true ,
        message: 'Password reset successful.',
        data : response
    });

}


const searchClient = async (req, res) => {
    try {
        const adminData = req.user;

        // Admin check 
        if (adminData.roll === 'client') {
            return res.json({
                status: false,
                message: "UnAuthenticated request | only logged-in admin can access this route"
            });
        }

        let { email, page = "1", limit = "10", name } = req.query;

        page = parseInt(page, 10);
        limit = parseInt(limit, 10);

        if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
            return res.status(400).json({ status: false, message: "Invalid pagination parameters" });
        }

       
        let query = { adminId: adminData._id };
        if (email) query.email = { $regex: `^${email}`, $options: "i" };
        if (name) query.name = { $regex: `^${name}`, $options: "i" };

        // const projection = { name: 1, email: 1, createdAt: 1 };
        const sort = { createdAt: -1 };

        // Get total count
        const count = await Client.countDocuments(query);

        // Fetch paginated data
        const data = await Client.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

            console.log(data);

        if (data.length === 0) {
            return res.status(400).json({ message: "No client found" });
        }

        // Calculate total pages
        const totalPages = Math.ceil(count / limit);

        return res.json({
            status: true,
            message: "Users fetched successfully",
            totalPages,
            data,
        });

    } catch (error) {
        console.error("Unexpected error in getClientList:", error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};


const getClientById = async(req , res) => {

    const {id} = req.params;   //clientId
    if(!id){
        return res.status(400).json({message:"client Id missing | please provide a client id"});
    }
    
    const adminData = req.user;
    //admin check 
    if(adminData.roll === 'client'){
        return res.json({
            status:false,
            message:"unAuthenticate request | only log in admin can access this route"
        })
    }

    const clientData = await Client.findById(id).select("-password");
    
    if(!clientData){
        return res.status(400).json({
            message : ""
        })
    }



    return res.status(200).json({
        status:true,
        data : clientData , 
        message : ".client data fetched successfully"
    })


}


const deleteClientById = async (req, res) => {
    try {
        const { id } = req.params;
        const adminData = req.user;

        // Check if user is an admin
        if (adminData.role === "client") {
            return res.status(401).json({
                status: false,
                message: "Only admin can delete a client",
            });
        }

        // Validate Object ID
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid userId",
            });
        }

        // Find user in database
        const dbUser = await Client.findById(id);

        if (!dbUser) {
            return res.status(400).json({
                status: false,
                message: "User not found | Invalid userId",
            });
        }

        // File paths
        const filePaths = [dbUser.profileImage, dbUser.companyLogo, dbUser.GstCertificate];

        // Function to delete files
        const deleteFile = (filePath) => {
            return new Promise((resolve, reject) => {
                if (!filePath) return resolve(); // Skip if no file
                
                fs.unlink(filePath, (err) => {
                    if (err && err.code !== "ENOENT") {
                        console.error(`Error deleting file: ${filePath}`, err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        };

        // Wait for all files to be deleted before deleting the user
        await Promise.all(filePaths.map(deleteFile));

        // Delete user from database
        const response = await Client.findByIdAndDelete(id);

        if (!response) {
            return res.status(500).json({
                message: "Failed to delete user data",
            });
        }

        return res.status(200).json({
            status: true,
            message: "User deleted successfully",
            data: {
                name: response.name,
                _id: response._id,
                email: response.email,
            },
        });
    } catch (error) {
        console.error("Failed to delete user", error);
        return res.status(500).json({ message: "Failed to delete user data" });
    }
}


const getClientList = async (req, res) => {
    try {
        const adminData = req.user;

  

        if (!adminData) {
            return res.status(400).json({
                status: false,
                message: "Invalid admin token | Admin not found with provided token",
            });
        }

        if (adminData.roll === "client") {
            return res.status(403).json({
                status: false,
                message: "Unauthorized request | Only logged-in admin can access this route",
            });
        }

        // Ensure admin ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(adminData._id)) {
            console.error("Invalid Admin ID:", adminData._id); // Debugging
            return res.status(400).json({
                status: false,
                message: "Invalid admin ID format",
            });
        }

        const admin = await User.findById(adminData._id);
        console.log(admin)
        if (!admin) {
            return res.status(404).json({
                status: false,
                message: "Admin not found",
            });
        }

        console.log("Admin ID:", admin._id); // Debugging

        // Ensure `adminId` is a valid ObjectId when querying
        const clientList = await Client.find({
            adminId: new mongoose.Types.ObjectId(admin._id),
        }).select("-password");

        if (!clientList || clientList.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Client list not found",
            });
        }

        return res.status(200).json({
            status: true,
            data: clientList,
            message: "Client list fetched successfully",
        });
    } catch (error) {
        console.error("Error in getClientList:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
        });
    }
};


module.exports = {
    registerClient , 
    login , 
    forgotPassword , 
    searchClient , 
    resetPassword , 
    getClientList , 
    getClientById , 
    deleteClientById  , 
    verifyOtp 
};



