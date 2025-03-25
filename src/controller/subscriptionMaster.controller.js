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
const SubscriptionMaster = require("../Model/subscriptionMaster");
const subscriptionMasterService = CreateService("SubscriptionMaster")
const logger = require("../logger");
const { isValidObjectId } = require("mongoose");

const createSubscription = async ( req , res ) => {

    try {

        const {plan , service , duration , price } = req.body;

    if ([plan, service , duration, price].some(field => !field)) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const userData = req.user;

    if(!userData){
        return res.status(400).json({
            message:"Authentication failed "
        })
    }

    if(userData.roll != 'admin'){
        return res.json("only admin can add a service")
    }

    const payload = {
        plan,
        duration,
        price,
        service
    }

    const response = await subscriptionMasterService.create(payload);

    if(!response){
        logger.error("fail to create service")
        return res.status(500).json({
            status:false ,
            message:"fail to create a service"
        })
    }

    return res.status(200).json({
        status : true ,
        message:"service created successfully",
        data : response
    })
    } catch (error) {
        logger.error("fail to create a service" , error);
        return res.json({status : false  , message:"fail to create a service | internal server error"})
    }

}


const getAllSubscription = async ( req , res ) => {

    try {
        const userData = req.user;
    
        if(!userData){
            return res.json({
                message:"Authentication fail"
            })
        }
    
        const allSubscriptions = await SubscriptionMaster.find();
    
        return res.status(200).json({status : true , message:"all subscriptions fetched successfully" , allSubscriptions})
    } catch (error) {
        error.logger("fail to get all subscriptions" , error);
        return res.status(500).json({status : false , message:"fail to get all subscriptions | internal server error"})
    }

}


const updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = req.body;

        if (!id) {
            return res.status(400).json({ message: "Subscription ID is required." });
        }

        // Ensure there's at least one field to update
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No valid fields provided for update." });
        }

        // Perform the update operation
        const response = await subscriptionMasterService.updateById(id, updateFields);

        if (!response.status) {
            logger.error(`Failed to update subscription ID: ${id}`, { response });
            return res.status(500).json({ message: "Failed to update subscription data." });
        }

        return res.status(200).json({
            status : true ,
            message: "Subscription updated successfully.",
            data : response
        });

    } catch (error) {
        logger.error("Error updating subscription", { error });
        return res.status(500).json({ message: "Internal server error. Unable to update subscription." });
    }
};


const updateService = async(req , res) => {
    const {id} = req.params;   //subscription id
    const userData = req.user;
    const updateService = req.body;

    if (!id) {
        return res.status(400).json({ message: "Subscription ID is required." });
    }

    if (Object.keys(updateService).length === 0) {
        return res.status(400).json({ message: "No valid fields provided for update." });
    }

    // Perform the update operation
    const response = await SubscriptionMaster.findByIdAndUpdate(id , {
        "service" : updateService
    })

    if (!response) {
        logger.error(`Failed to update subscription ID: ${id}`, { response });
        return res.status(500).json({ status : false , message: "Failed to update subscription data." , response });
    }

    return res.status(200).json({
        status : true ,
        message: "Subscription services updated successfully.",
        data : response
    });

}


const deleteSubscription = async(req , res) => {

    try {
        const {id} = req.params;
     
        const userData = req.user;

        if(!id){
            return res.status(400).json({message:"please provide a subscription id"})
        }

        if(!userData){
            return res.status(400).json({
                status : false ,
                message:"Authentication fail"
            })
        }
    
        if(userData.roll != 'admin'){
            return res.status(400).json({
                status : false ,
                message:"only admin can delete subscription"
            })     
        }
    
        if(!isValidObjectId(id)){
            return res.status(400).json({status : false , message:"invalid subscription ID"})
        }
    
        const subscription = await subscriptionMasterService.findById(id);
    
        if(!subscription){
            return res.json({
                status : false , 
                message:"invalid subscription ID"
            })
        }
        
        const response = await subscriptionMasterService.deleteById(id);
    
        if(!response){
            return res.status(200).json({
                status : false ,
                message:"subscription deleted successfully"
            })
        }
    
        return res.status(200).json({
            message:"subscription deleted successfully",
            status : true ,
            data : response
        })
    } catch (error) {
        logger.error("Error in deleting subscription", { error });
        return res.status(500).json({ message: "Internal server error. Unable to delete subscription." });
    }

} 




module.exports = { 
    createSubscription , 
    getAllSubscription , 
    updateSubscription , 
    updateService , 
    deleteSubscription 
}


