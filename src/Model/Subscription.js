const { string, required, number } = require('joi');
const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "SubscriptionMaster"
  },
  startDate:{
    type:Date ,
    required:true
  },
  endDate:{
    type:Date,
    requires:true
  },
  status:{
    type:String,
    required:true
  },
  coupon:{
    type:Boolean,
    required:true,
    default:false
  },
  purchasePrice: {
    type:Number,
    required:true
  },
  quantity:{
    type:Number,
    required:true,
    default:1
  },
  remainingDays:{
    type:Number,
    require:true
  }
// services: {
//   type:mongoose.Schema.Types.ObjectId,
//   ref:"SubscriptionMaster"
// }
  
}, { timestamps: true });

const Subscription = mongoose.model('Subscription', SubscriptionSchema);
module.exports = Subscription;

