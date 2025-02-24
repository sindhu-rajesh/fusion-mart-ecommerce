import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });

    return res.status(200).json(coupon || null);
  } catch (error) {
    console.log("Error in getCoupon controller: " + error.message);
    res.status(500).json({ message: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({
      code,
      userId: req.user._id,
      isActive: true,
    });

    if (!coupon) {
      return res.status(400).json({ message: "Coupon code is not valid" });
    }

    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(400).json({ message: "Coupon has expired" });
    }

    return res.status(200).json({
      message: "Coupon code is valid",
      code: coupon.code,
      discount: coupon.discountPercentage,
    });
  } catch (error) {
    console.log("Error in validateCoupon controller: " + error.message);
    return res.status(500).json({ message: error.message });
  }
};
