const {  
    generateAccessToken,
    generateRefreshToken, 
    verifyToken , 
    deleteToken , 
    updateRefreshToken , 
    tokenWithExpiry
} = require("../services/authService");
const CreateService = require("../services/CreateServices");
const Subscription = require("../Model/Subscription");
const subscriptionService = CreateService("Subscription")
const logger = require("../logger");
const User = require("../Model/user.model")
const SubscriptionMater = require("../Model/subscriptionMaster");
const { isValidObjectId } = require("mongoose");
const mongoose = require("mongoose")

const createSubscriptions = async (req, res) => {
    try {
      const { planid } = req.params;
      const userId = req.user?._id;
      const { quantity , coupon = 0 } = req.body;


  
      // Validate User & Existing Subscription in a single query
      const user = await User.findById(userId).select("subscription");
      if (!user) return res.status(404).json({status:false , message: "User not found" });
  
      if (user.subscription) {
        return res.status(400).json({ message: "User already has a subscription" });
      }
  
    // Validate Plan
    const plan = await SubscriptionMater.findById(planid);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // Extract subscription duration safely
    const durationMatch = plan.duration.match(/\d+/);
    if (!durationMatch) {
      return res.status(400).json({ message: "Invalid plan duration format" });
    }
    const durationMonths = parseInt(durationMatch[0], 10);

    // Ensure quantity is a valid number 

    // Calculate Subscription Dates safely
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + durationMonths * quantity);
    
    const status = Date.now() <= endDate.getTime() ? "active" : "inactive";
    
    const currentDate = new Date();
    const remainingDays = currentDate <= endDate 
      ? Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24)) 
      : 0; // If the endDate has passed, remainingMonths should be 0

    const priceNumber = parseFloat(plan.price.replace(/[^0-9.]/g, ""));

    const discountAmount = (priceNumber * coupon) / 100;
    const purchasePrice = priceNumber - discountAmount;
    
  
      // Create Subscription First
      const newSubscription = await Subscription.create({
        userId,
        planId: planid,
        startDate,
        remainingDays,
        endDate,
        status,
        quantity: quantity? quantity : 1,
        purchasePrice,
        coupon : coupon ? true : false,
    });

  
    const response = await Subscription.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(newSubscription._id) }
        },
        {
          $lookup: {
            from: "users", 
            localField: "userId",
            foreignField: "_id",
            as: "userData"
          }
        },
        {
          $unwind: { path: "$userData", preserveNullAndEmptyArrays: true }
        },
        {
          $lookup: {
            from: "subscriptionmasters",
            localField: "planId",
            foreignField: "_id",
            as: "planData"
          }
        },
        {
          $unwind: { path: "$planData", preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            _id: 1,
            startDate: 1,
            endDate: 1,
            remainingMonths:1,
            status:1,
            purchasePrice:1,
            coupon:1, 
            user: {
              _id: "$userData._id",
              name: "$userData.name",
              email: "$userData.email"
            },
            plan: {
              _id: "$planData._id",
              plan: "$planData.plan",
              price: "$planData.price"
            }
          }
        }
    ]);
        
    //console.log(response); 
  
      //Update User with Subscription ID
      user.subscription = newSubscription._id;
      await user.save();
  
      return res.status(201).json({
        message: "Subscription created successfully",
        status:true,
        data: response[0], // Send aggregated data
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      return res.status(500).json({ status:false , message: "Internal Server Error" });
    }
};





module.exports = {
    createSubscriptions 
    
}



