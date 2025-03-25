

const Razorpay = require("razorpay");
const crypto = require("crypto");
const logger = require('../logger');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Function to create an order
const createOrder = async (amount, currency = "INR") => {
  try {
    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    logger.error("fail to create a order")
    throw new Error(error.message);
  }
};



// Function to verify payment
const verifyPayment = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  try {
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    return generated_signature === razorpay_signature;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { createOrder, verifyPayment };

