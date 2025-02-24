// import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});

    return res.status(200).json({ products });
  } catch (error) {
    console.error("Error in get all products: " + error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    // if featured products are available
    let featuredProducts = await redis.get("featured_products");

    if (featuredProducts) {
      return res.status(200).json(JSON.parse(featuredProducts));
    }

    // if featured products are not available
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      return res.status(404).json({ message: "Featured products not found" });
    }

    // store in redis if featured products are available
    await redis.set("featured_products", JSON.stringify(featuredProducts));

    return res.status(200).json(featuredProducts);
  } catch (error) {
    console.log("Error in get featured products: " + error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, category, countInStock } =
      req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "fusion-mart-ecommerce",
      });
    }

    const product = await Product.create({
      name,
      price,
      description,
      image: cloudinaryResponse ? cloudinaryResponse.secure_url : "",
      category,
      countInStock,
    });

    return res.status(201).json(product);
  } catch (error) {
    console.log("Error in create product: " + error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]; // to  get the id of the image
      try {
        await cloudinary.uploader.destroy(`fusion-mart-ecommerce/${publicId}`);
        console.log("Image deleted successfully from cloudinary");
      } catch (error) {
        console.log("Error deleting image from cloudinary");
      }
    }
    await Product.findByIdAndDelete(id);

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in delete product: " + error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const product = await Product.aggregate([
      {
        $sample: { size: 4 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          description: 1,
          image: 1,
          category: 1,
          countInStock: 1,
          rating: 1,
        },
      },
    ]);

    return res.status(200).json(product);
  } catch (error) {
    console.log("Error in getRecommendedProducts: " + error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });

    return res.status(200).json({ products });
  } catch (error) {
    console.log("Error in getRecommendedProducts: " + error.message);
    return res.status(500).json({ message: error.message });
  }
};

async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();

    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("Error in updateFeaturedProductsCache: " + error.message);
  }
}

export const toggleFeatureProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(id);

    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();

      // update the redis cache
      await updateFeaturedProductsCache();
      return res.status(200).json(updatedProduct);
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeatureProduct: " + error.message);
    return res.status(500).json({ message: error.message });
  }
};
