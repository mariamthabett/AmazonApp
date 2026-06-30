const User = require("../models/User");

// @desc   Get my wishlist (populated products)
// @route  GET /api/wishlist
// @access Private
const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "wishlist",
    populate: { path: "category", select: "name" },
  });
  res.json(user?.wishlist || []);
};

// @desc   Add a product to my wishlist
// @route  POST /api/wishlist/:productId
// @access Private
const addToWishlist = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: req.params.productId } },
    { new: true }
  );
  res.status(201).json(user.wishlist); // مصفوفة IDs
};

// @desc   Remove a product from my wishlist
// @route  DELETE /api/wishlist/:productId
// @access Private
const removeFromWishlist = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: req.params.productId } },
    { new: true }
  );
  res.json(user.wishlist); // مصفوفة IDs
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
