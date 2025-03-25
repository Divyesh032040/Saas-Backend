


const mongoose = require("mongoose");
const { type } = require("../validation/registerSchema");

const userSchema = new mongoose.Schema(
  {
    roll: {
      type: String,
      required: true,
      enum: ["admin", "superadmin"],
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      match: [/^\d{10,15}$/, "Please enter a valid phone number"],
    },
    mobile: {
      type: String,
      required: true,
      match: [/^\d{10,15}$/, "Please enter a valid mobile number"],
    },
    whatsappNumber: {
      type: String,
      required: true,
      match: [/^\d{10,15}$/, "Please enter a valid WhatsApp number"],
    },
    profileImage: {
      type: String,
      trim: true,
      default: "",
    },
    companyLogo: {
      type: String,
      trim: true,
      default: "",
    },
    addresses: [
      {
        addressType: {
          type: String,
          enum: ["shipping", "billing", "home", "office"],
          required: true,
        },
        address: { type: String, required: true },
        zipcode: { type: Number, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
      },
    ],
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
    PANNumber: {
      type: String,
      required: true,
      trim: true,
      match :[
        /[A-Z]{5}[0-9]{4}[A-Z]{1}/ , "please provide a valid PAN Number"
      ]
    },
    GstCertificate: {
      type: String,
      trim: true,
      default: null,
    },
    jobPosition: {
      type: String,
      required: true,
      trim: true,
    },
    GstTreatment:[
      {
        Treatment : {
          type:String,
          required:true
        }
      }
    ],
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    defectDiscount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    clients: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Client', 
        default: [] 
      }
    ]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;


