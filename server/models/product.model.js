import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      min: 0,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: [true, "Product image is required"],
    },

    category: {
      type: String,
      required: true,
    },

    countInStock: {
      type: Number,
      required: true,
      min: 0,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
