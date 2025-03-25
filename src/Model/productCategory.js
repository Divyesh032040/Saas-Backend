const mongoose = require('mongoose');

// Define the Product schema
const productCategorySchema = new mongoose.Schema({

  categoryName:{
        type:String,
        required:true
        
    },
    parentCategory:{
      type:String,
      required:true,
      default:"main"
    },
    createdBy:{
      type:mongoose.Schema.ObjectId,
      ref:"User"
    }

},{
  timestamps: true, // Optionally add timestamps for createdAt and updatedAt
});

// Create and export the Product model
const ProductCategory = mongoose.model('ProductCategory', productCategorySchema);

module.exports = ProductCategory;
