import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const user = req.user;

    const products = await Product.find({ _id: { $in: user.cartItems } });

    // add quantity of each product
    const cartItems = products.map((product) => {
      const item = user.cartItems.find(
        (cartItem) => cartItem.id === product._id.toString()    
      );

      return { ...product.toJSON(), quantity: item.quantity };
    });

    return res.status(200).json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts controller: " + error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }

    await user.save();

    return res.status(200).json(user.cartItems);
  } catch (error) {
    console.log("Error in addToCart controller: " + error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    }
    await user.save();
    return res.status(200).json(user.cartItems);
  } catch (error) {
    console.log("Error in removeAllFromCart controller: " + error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);

    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        return res.status(200).json(user.cartItems);
      }
      existingItem.quantity = quantity;
      await user.save();
      return res.status(200).json(user.cartItems);
    } else {
      return res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (error) {
    console.log("Error in updateQuantity controller: " + error.message);
    return res.status(500).json({ message: error.message });
  }
};
