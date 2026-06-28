const Product = require("../models/Product");

// @desc   Get all products (with search / category / price filter)
// @route  GET /api/products
// @access Public
const getProducts = async (req, res) => {
  const { keyword, category, minPrice, maxPrice } = req.query;

  const filter = {};
  if (keyword) {
    filter.title = { $regex: keyword, $options: "i" };
  }
  if (category) {
    filter.category = category;
  }
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const products = await Product.find(filter)
    .populate("category", "name")
    .sort({ createdAt: -1 });

  res.json(products);
};

// @desc   Get a single product
// @route  GET /api/products/:id
// @access Public
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name"
  );
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
};

// @desc   Create a product
// @route  POST /api/products
// @access Admin
const createProduct = async (req, res) => {
  const { title, description, price, stock, image, category } = req.body;
  if (!title || !category) {
    res.status(400);
    throw new Error("Title and category are required");
  }
  const product = await Product.create({
    title,
    description,
    price,
    stock,
    image,
    category,
  });
  res.status(201).json(product);
};

// @desc   Update a product
// @route  PUT /api/products/:id
// @access Admin
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const fields = ["title", "description", "price", "stock", "image", "category"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });

  const updated = await product.save();
  res.json(updated);
};

// @desc   Delete a product
// @route  DELETE /api/products/:id
// @access Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  await product.deleteOne();
  res.json({ message: "Product removed" });
};

// @desc   Add a review to a product
// @route  POST /api/products/:id/reviews
// @access Private (customer)
const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error("Product already reviewed");
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) /
    product.reviews.length;

  await product.save();
  res.status(201).json({ message: "Review added" });
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
};
