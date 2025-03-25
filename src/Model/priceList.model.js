const mongoose = require('mongoose');

// Define the Product schema
const priceListSchema = new mongoose.Schema({

    price:{
        type:Number , 
        required:true
    },
    clientId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }


}, {
  timestamps: true, // Optionally add timestamps for createdAt and updatedAt
});

// Create and export the Product model
const PriceList = mongoose.model('PriceList', priceListSchema);

module.exports = PriceList;
