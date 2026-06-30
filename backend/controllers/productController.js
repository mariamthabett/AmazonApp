const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// نهرب الحروف الخاصة في الـ regex عشان نمنع هجمات ReDoS من البحث
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// @desc   Get all products (with search / category / price filter + pagination)
// @route  GET /api/products?keyword=&category=&minPrice=&maxPrice=&page=&limit=
// @access Public
const getProducts = async (req, res) => {
  const { keyword, category, minPrice, maxPrice } = req.query;

  const filter = {};
  if (keyword) {
    filter.title = { $regex: escapeRegex(keyword), $options: "i" };
  }
  if (category) {
    filter.category = category;
  }
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // الترتيب
  const sortMap = {
    newest: { createdAt: -1 },
    priceLow: { price: 1 },
    priceHigh: { price: -1 },
    rating: { rating: -1 },
  };
  const sort = sortMap[req.query.sort] || sortMap.newest;

  // الصفحات: افتراضي 12 منتج في الصفحة، بحد أقصى 100
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 12));
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ products, page, pages: Math.ceil(total / limit) || 1, total });
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

// @desc   Upload a product image to Cloudinary (admin)
// @route  POST /api/products/upload
// @access Admin
// Body: { image: "<base64 data URI>" }  -> returns { url }
const uploadProductImage = async (req, res) => {
  const { image } = req.body;
  if (!image) {
    res.status(400);
    throw new Error("No image provided");
  }
  const uploaded = await cloudinary.uploader.upload(image, {
    folder: "amazonapp/products",
    resource_type: "image",
    transformation: [{ width: 600, height: 600, crop: "fill", quality: "auto" }],
  });
  res.status(201).json({ url: uploaded.secure_url });
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
  uploadProductImage,
  createProductReview,
};
