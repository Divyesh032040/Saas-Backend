const { createOrder, verifyPayment } = require("../services/razorpay");
const fs = require("fs");
const path = require("path");



// @route POST /payment/createOrder
const createOrderController = async (req, res) => {
  try {
    const { amount, currency , receipt , note } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: "Amount and currency are required" });
    }


    const order = await createOrder(amount, currency);

    res.json({ status: true, order })

  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};



// @route POST /payment/verify-payment
 
 
const verifyPaymentController = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required payment details" });
    }

    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (isValid) {
      res.status(200).json({ status: true , message : "Payment verified successfully" , data : isValid});
    } else {
      res.status(400).json({status:false , error: "Invalid payment signature" });
    }

  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ status:false , error: "Payment verification failed" });
  }
};

module.exports = { createOrderController, verifyPaymentController };

