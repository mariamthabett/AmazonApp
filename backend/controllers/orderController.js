const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc   Create a new order
// @route  POST /api/orders
// @access Private (customer)
const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // طريقة الدفع: الدفع عند الاستلام (COD) افتراضيًا، أو بطاقة (Card)
  const method = paymentMethod === "Card" ? "Card" : "COD";
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

  // نبني عناصر الطلب من الداتابيز (مش بنثق في أسعار العميل)
  const orderItems = [];
  let totalPrice = 0;

  for (const item of items) {
    const qty = Math.max(1, Number(item.qty) || 0);
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }
    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.image,
      price: product.price,
      qty,
    });
    totalPrice += product.price * qty;
  }

  // خصم المخزون بشكل ذرّي (atomic): الشرط stock >= qty داخل نفس العملية،
  // فلو اتنين طلبوا آخر قطعة في نفس اللحظة واحد بس هينجح. ولو فشل عنصر،
  // بنرجّع (rollback) العناصر اللي اتخصمت قبله.
  const decremented = [];
  for (const item of orderItems) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.qty } },
      { $inc: { stock: -item.qty } },
      { new: true }
    );
    if (!updated) {
      // فشل — نرجّع كل اللي اتخصم
      for (const done of decremented) {
        await Product.updateOne(
          { _id: done.product },
          { $inc: { stock: done.qty } }
        );
      }
      res.status(400);
      throw new Error(`Not enough stock for ${item.title}`);
    }
    decremented.push(item);
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: method,
    totalPrice,
    status: "Pending",
  });

  res.status(201).json(order);
};

// @desc   Pay for an order (simulated card payment)
// @route  PUT /api/orders/:id/pay
// @access Private (order owner)
const payOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // صاحب الطلب فقط (أو أدمن) يقدر يدفع
  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to pay for this order");
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error("Order is already paid");
  }

  // محاكاة دفع بكارت: بنتحقق شكليًا بس من بيانات الكارت (مش بنخزّن الرقم كامل)
  const { cardNumber, brand } = req.body || {};
  const digits = String(cardNumber || "").replace(/\D/g, "");
  if (digits.length < 12) {
    res.status(400);
    throw new Error("Invalid card number");
  }

  order.isPaid = true;
  order.paidAt = new Date();
  order.status = "Paid";
  order.paymentResult = {
    id: `SIM-${order._id.toString().slice(-8).toUpperCase()}`,
    status: "succeeded",
    brand: brand || "card",
    last4: digits.slice(-4),
    updatedAt: new Date(),
  };

  const updated = await order.save();
  res.json(updated);
};

// @desc   Cancel an order (owner) — restores stock
// @route  PUT /api/orders/:id/cancel
// @access Private (order owner or admin)
const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to cancel this order");
  }

  // نسمح بالإلغاء بس قبل ما يتشحن
  if (!["Pending", "Paid", "Processing"].includes(order.status)) {
    res.status(400);
    throw new Error(`Order cannot be cancelled (status: ${order.status})`);
  }

  // نرجّع المخزون لكل منتج في الطلب
  for (const item of order.orderItems) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { stock: item.qty } }
    );
  }

  order.status = "Cancelled";
  const updated = await order.save();
  res.json(updated);
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
  payOrder,
  cancelOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
};
