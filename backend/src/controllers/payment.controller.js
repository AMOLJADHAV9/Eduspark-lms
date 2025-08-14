const { createRazorpayInstance } = require("../config/razorpay.config");
const crypto = require("crypto");
require("dotenv").config();

const razorpayInstance = createRazorpayInstance();

exports.createOrder = async (req, res) => {
    // dont accept amount from the request body
    const { courseId, price } = req.body;

    // course id to fetching the course data including its price 
    // create an order in razorpay 
    const options = {
        amount: price,
        currency: "INR",
        receipt: `receipt_order_${courseId}`,
    };

    try {
        const order = await razorpayInstance.orders.create(options);
        return res.status(200).json({
            success: true,
            message: "Order created successfully",
            order,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in creating order",
            error: error.message,
        });
    }
};

exports.verifyPayment = async (req, res) => {
    const { order_id, payment_id, signature } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET;

    // create hmac objects 
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(order_id + "|" + payment_id);

    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === signature) {
        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
        });
    } else {
        return res.status(400).json({
            success: false,
            message: "Payment verification failed",
        });
    }
};