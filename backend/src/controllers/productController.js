import * as productService from "../services/productService.js"


export const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductDetails(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchProducts = async (req, res) => {

  try {
    const q = req.query.q || "";
    const products = await productService.searchProducts(q);
    res.json(products);
    console.log("aaaaaaaaa",products)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
