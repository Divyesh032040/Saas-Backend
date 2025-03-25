const {  
    generateAccessToken,
    generateRefreshToken, 
    verifyToken , 
    deleteToken , 
    updateRefreshToken , 
    tokenWithExpiry
} = require("../services/authService");
// const CreateService = require("../services/CreateServices");
// const orgService = CreateService("Client");
const logger = require("../logger");
const User = require("../Model/user.model"); 
const clientService = require("../services/clientService")
const {isValidObjectId} = require("mongoose")
const fs = require("fs");
const PriceList = require("../Model/priceList.model");



// Controller function to register a new admin 
const registerAdmin = async (req, res) => {
  try {

    // Destructure the fields from the request body
    const {
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
        roll,


    } = req.body;

    // file handing

    const profileImage = req.files.profileImage[0].path;
    const companyLogo = req.files.companyLogo[0].path;  
    const GstCertificate = req.files.GstCertificate[0].path;
    
    if (!req.files?.profileImage?.[0]?.path) {
        return res.status(400).json({
            status: false,
            message: "Profile image is required"
        });
    }
    
    if (!req.files?.companyLogo?.[0]?.path) {
        return res.status(400).json({
            status: false,
            message: "Company logo is required"
        });
    }
    
    if (!req.files?.GstCertificate?.[0]?.path) {
        return res.status(400).json({
            status: false,
            message: "GST certificate is required"
        });
    }
    
    

    // console.log(profilePath , companyLogoPath , GstCertificatePath)

    // Check if user already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
        return res.status(400).json({ status:true , message: "Admin with this email already exists" });
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
    const newAdmin = new User({
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
        GstTreatment : gstTreatmentData ,
        tax,
        defectDiscount,
        roll,
    });

    // Save the new client to the database
    const response = await newAdmin.save()

    // Send response
    res.status(201).json({
    status:true,
    message: "Admin successfully registered",
    data : response 
    });
  } catch (error) {
    logger.error("fail to register Admin" , error)
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};


//login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user by email
        const admin = await User.findOne({ email });

        if (!admin) {
            return res.status(400).json({ status: false, message: "Invalid email or admin not found" });
        }

        // Validate password
        const passwordMatch = await clientService.passwordValidate(password, admin.password);

        if (!passwordMatch) {
            return res.status(400).json({ status: false, message: "Invalid password" });
        }

        // Generate Tokens
        let accessToken, refreshToken;
        try {
            accessToken = generateAccessToken({ id: admin._id, email: admin.email });
            refreshToken = generateRefreshToken({ id: admin._id, email: admin.email });
        } catch (tokenError) {
            logger.error("Token generation error:", tokenError);
            return res.status(500).json({ message: "Failed to generate tokens" });
        }

        // Send success response
        return res.status(200).json({
            status: true,
            message: "Admin logged in successfully",
            data: {
                adminData: { id: admin._id, email: admin.email, role: admin.role }, // Send only necessary data
                tokens: { accessToken, refreshToken }
            },
        });

    } catch (error) {
        logger.error("Unexpected Error in login:", error);
        return res.status(500).json({ message: "Failed to login user | INTERNAL SERVER ERROR" });
    }
};


//delete admin by id 
const deleteAdmin = async (req, res) => {
    try {
    const adminData = req.user;
        // console.log(adminData._id)

        if(!adminData){
          return res.status(400).json({
            status:false,
            message :"invalid access ! unauthenticated request"
          })
        }
        const id = adminData._id
        if(!isValidObjectId(id)){
            return res.status(400).json({
                message : "invalid admin id"
            })
        }

        //find user in database
        const dbUser = await User.findById(id);

        if(!dbUser){
          logger.error("fail to fetch admin data from database");
          return res.status(400).json({
            status:false,
                message :"admin data not found"
            });  
        }

        if(dbUser._id.toString() != adminData._id.toString()){
            return res.status(400).json({message:"admin can only delete there clients"});
        }

        //delete a profile picture 
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

        const data = await User.deleteOne(dbUser?._Id);

        
        if(!data){
            logger.error("fail to delete admin")
            return res.status(500).json({
                status:true ,
                data:"Fail to delete a userData"
            })
        }

        return res.status(200).json({
            status:true,
            message:"admin deleted with associate media successfully",
            data
        })
    } catch (error) {
        logger.error("Failed to delete admin", error);
        return res.status(500).json({ message: "Failed to delete admin data" });
    }
};



//getState
const fetch = require("node-fetch");

const getState = async ( req , res) => {

    try {
        const headers = new Headers();
        headers.append("X-CSCAPI-KEY", `${process.env.STATE_API}`); // Replace with a valid API key

        const requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        };

        const response = await fetch("https://api.countrystatecity.in/v1/countries/IN/states", requestOptions);
        const data = await response.json();
        
        return res.status(200).json({ states: data });
    } catch (error) {
        logger.json("Failed to fetch states" , error);
        return res.status(500).json({ message: "Failed to fetch states", error: error.message });
    }
};

const getCountry = async (req , res) => {
    try {
        const headers = new Headers();
        headers.append("X-CSCAPI-KEY", `${process.env.STATE_API}`); // Replace with a valid API key

        const requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        };

        const response = await fetch("https://api.countrystatecity.in/v1/countries", requestOptions);
        const data = await response.json();
        
        return res.status(200).json({ Country: data });

    } catch (error) {
        logger.error("failed to fetch country" , error);
        return res.status(500).json({ message: "Failed to fetch states", error: error.message });
    }
}



module.exports = {registerAdmin , adminLogin , deleteAdmin , getState , getCountry };



