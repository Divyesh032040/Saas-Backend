const mongoose = require('mongoose');

// Define the Product schema
const productSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the Client collection
    required: true,
    default:null
  },
  productName: {
    type: String,
    required: true,
  },
  productActive: {
    type: Boolean,
    default: true,
  },
  salesPrice: {
    type: Number,
    required: true,
  },
  productCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory', // Reference to the ProductCategory collection
    required: false,
  },
  HSN_SACCode: {
    type: String,
    required: true,
  },
  productImage: {
    type: String,
    required: false, // Optional field
    default:""
  },
}, {
  timestamps: true, // Optionally add timestamps for createdAt and updatedAt
});

// Create and export the Product model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
