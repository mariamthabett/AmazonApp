const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc   Create a new order
// @route  POST /api/orders
// @access Private (customer)
const createOrder = async (req, res) => {
  const { items, shippingAddress } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }
  if (
    !shippingAddress ||
    !shippingAddress.fullName ||
    !shippingAddress.address ||
    !shippingAddress.city ||
    !shippingAddress.phone
  ) {
    res.status(400);
    throw new Error("Complete shipping address is required");
  }

  // Build order items from the DB (never trust client prices) and check stock
  const orderItems = [];
  let totalPrice = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }
    if (product.stock < item.qty) {
      res.status(400);
      throw new Error(`Not enough stock for ${product.title}`);
    }

    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.image,
      price: product.price,
      qty: item.qty,
    });
    totalPrice += product.price * item.qty;
  }

  // Decrement stock
  for (const item of orderItems) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { stock: -item.qty } }
    );
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    totalPrice,
    status: "Pending",
  });

  res.status(201).json(order);
};

// @desc   Get logged-in user's orders
// @route  GET /api/orders/mine
// @access Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
};

// @desc   Get a single order (owner or admin)
// @route  GET /api/orders/:id
// @access Private
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }
  res.json(order);
};

// @desc   Get all orders
// @route  GET /api/orders
// @access Admin
const getOrders = async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json(orders);
};

// @desc   Update order status
// @route  PUT /api/orders/:id/status
// @access Admin
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  if (status === "Paid" && !order.isPaid) {
    order.isPaid = true;
    order.paidAt = new Date();
  }

  const updated = await order.save();
  res.json(updated);
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
};
