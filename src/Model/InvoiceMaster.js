
const mongoose = require('mongoose');

const InvoiceMasterSchema = new mongoose.Schema({

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "SubscriptionMaster"
  },
  invoiceDate:{
    type:Date ,
    required:true
  },
  dueDate:{
    type:Date,
    requires:true
  },
  amount:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Subscriptions"
  },
  remainingMonths:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Subscriptions"
  },
  // purchasePrice: {
  //   type:Number,
  //   required:true
  // },
  status:{
    type:String,
    required:true,
  },
  nextInvoiceDate:{
    type:Date,
    require:true
  }
  
}, { timestamps: true });

const Subscription = mongoose.model('Subscription', SubscriptionSchema);
module.exports = Subscription;

