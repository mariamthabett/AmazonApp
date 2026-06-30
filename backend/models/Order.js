const mongoose = require("mongoose");

// Each line item is a snapshot of the product at order time
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      phone: { type: String, required: true },
    },
    totalPrice: { type: Number, required: true, default: 0 },
    // طريقة الدفع: الدفع عند الاستلام أو بطاقة (محاكاة)
    paymentMethod: {
      type: String,
      enum: ["COD", "Card"],
      default: "COD",
    },
    // نتيجة عملية الدفع بالبطاقة (محاكاة — مش بنخزّن بيانات كارت حقيقية)
    paymentResult: {
      id: { type: String },
      status: { type: String },
      brand: { type: String },
      last4: { type: String },
      updatedAt: { type: Date },
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Refunded",
      ],
      default: "Pending",
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
