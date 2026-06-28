const Category = require("../models/Category");

// @desc   Get all categories
// @route  GET /api/categories
// @access Public
const getCategories = async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });
  res.json(categories);
};

// @desc   Create a category
// @route  POST /api/categories
// @access Admin
const createCategory = async (req, res) => {
  const { name, image } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }
  const category = await Category.create({ name, image });
  res.status(201).json(category);
};

// @desc   Delete a category
// @route  DELETE /api/categories/:id
// @access Admin
const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  await category.deleteOne();
  res.json({ message: "Category removed" });
};

module.exports = { getCategories, createCategory, deleteCategory };
