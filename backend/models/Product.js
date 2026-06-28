const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    // product name
    title: { type: String, required: true, trim: true },

    // description of the product
    description: { type: String, default: "" },

    // price of the product
    price: { type: Number, required: true, default: 0 },

    // image of the product
    image: { type: String, default: "" },

    //category
     category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    //in stock
    stock: { type: Number, required: true, default: 0 },

    // reviews
    reviews: [reviewSchema],

    //ratings
    rating: { type: Number, default: 0, min: 0, max: 5 },

    //numReviews
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Product", productSchema);