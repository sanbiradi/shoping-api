const Order = require("../models/Orders");
const Shopuser = require("../models/Shopuser");
const createOrder = async (req, res) => {
  const userId = req.id; // Assuming userId is passed as a URL parameter
  try {
    const { items, deliveryFee, total, address } = req.body;

    // Create a new order
    const newOrder = new Order({
      items,
      deliveryFee,
      total,
      address,
      status: "pending",
    });

    // Save the new order
    const savedOrder = await newOrder.save();

    // Find the user and update their orders array
    await Shopuser.findByIdAndUpdate(userId, {
      $push: { orders: savedOrder._id },
    });

    // Respond with the saved order
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ error: "Failed to create order", message: error.message });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get order details", message: error.message });
  }
};

const updateOrder = async (req, res) => {
  const { status, id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    switch (status) {
      case "cancel":
        // Assume status is a field to track order state
        order.status = "Cancelled";
        break;
      case "dispatch":
        order.status = "Dispatch";
        break;
      case "deliver":
        order.status = "Delivered";
        break;
      default:
        return res
          .status(400)
          .json({ message: `Action '${action}' is not supported` });
    }

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update order", message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  const userId = req.id; // Assuming userId is passed as a URL parameter

  try {
    // Find the user by ID and populate the orders field
    const user = await Shopuser.findById(userId).populate("orders");

    if (!user) {
      return res.status(404).json({ error: "User not found" }); // Early return if user not found
    }

    // Return the user's orders
    return res.status(200).json({ orders: user.orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Server error" }); // Early return on server error
  }
};

const confirmOrder = async (req, res) => {
  const orderId = req.params.id;

  try {
    const { nameOnCard, cardNumber, expiry, cvv } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = "success";
    order.paymentDetails = {
      nameOnCard,
      cardNumber,
      expiry,
      cvv,
    };

    const updatedOrder = await order.save();

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error confirming order:", error);
    return res
      .status(500)
      .json({ error: "Server error", message: error.message });
  }
};


module.exports = {
  createOrder,
  getOrderDetails,
  updateOrder,
  getAllOrders,
  confirmOrder,
};
