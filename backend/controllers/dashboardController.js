const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// @desc   Admin dashboard stats
// @route  GET /api/admin/stats
// @access Admin
const getStats = async (req, res) => {
  const [totalProducts, totalOrders, totalUsers, revenueAgg, statusAgg, recentOrders, topAgg] =
    await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: "customer" }),
      // الإيرادات = مجموع الطلبات المدفوعة
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      // عدد الطلبات حسب الحالة
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      // آخر 5 طلبات
      Order.find({})
        .populate("user", "firstName lastName email")
        .sort({ createdAt: -1 })
        .limit(5),
      // أكتر المنتجات مبيعًا (مجموع الكميات)
      Order.aggregate([
        { $unwind: "$orderItems" },
        {
          $group: {
            _id: "$orderItems.product",
            title: { $first: "$orderItems.title" },
            image: { $first: "$orderItems.image" },
            sold: { $sum: "$orderItems.qty" },
            revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
          },
        },
        { $sort: { sold: -1 } },
        { $limit: 5 },
      ]),
    ]);

  const ordersByStatus = {};
  statusAgg.forEach((s) => (ordersByStatus[s._id] = s.count));

  res.json({
    totals: {
      products: totalProducts,
      orders: totalOrders,
      customers: totalUsers,
      revenue: revenueAgg[0]?.total || 0,
    },
    ordersByStatus,
    recentOrders,
    topProducts: topAgg,
  });
};

module.exports = { getStats };
