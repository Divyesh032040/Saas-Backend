const mongoose = require("mongoose");

const subscriptionMasterSchema = new mongoose.Schema({

    plan:{
        type:String,
        required:true,
        // enum:["basic" , "medium" , "advances"]
    },
    duration:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    service:[
        {
            serviceName: { type: String, required: true },
            serviceDescription: { type: String }
        }
    ]

}, {timestamps:true});

const SubscriptionMaster =
  mongoose.models.SubscriptionMaster ||
  mongoose.model("SubscriptionMaster", subscriptionMasterSchema);

module.exports = SubscriptionMaster;





