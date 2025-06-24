import * as productService from "../services/productService.js"


export const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductDetails = async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const createProduct = async (req, res) => {
    try {
        const productData = req.body;
        const newProduct = await productService.createProduct(productData);
        console.log("THIS IS THE NEW PRODUCT", productData);

        res.status(200).json(newProduct);

    } catch (err) {
        console.error('Error creating data:', err);
        res.status(500).json({ message: "Internal Server Error"});
    }
    
}

export const updateProduct = async (req, res) => {
    // try {
        const productId = req.params.id;
        const productData = req.body;
        console.log("First Stop>>>", productId," >>", productData);
        const updateProduct = await productService.updateProduct(productId, productData);
        console.log("Second Stop", updateProduct)
        if (!updateProduct) {
            return res.status(404).json({ message: "Client not found"});
        }
        res.status(200).json(updateProduct)
      }


export const deleteProduct = async (req, res) => {
  console.log("DELETE 1")
    try {
        const productId = req.params.id;
        const deleted = await productService.deleteProduct(productId);
        if (!deleted) {
            return res.status(404).json({message: 'Client not found'});
        }
        res.status(200).send();
        } catch (err) {
            console.error('Error deleting clients', err);
            res.status(500).json({message: 'Internal Server Error'})
        }
    }



    //images multipart upload and delete

export const uploadProductImages = async (req, res) => {
  const productId = Number(req.params.id);
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  try {
    const inserted = await productService.addImages(productId, req.files, req);
    res.status(201).json(inserted);
  } catch (err) {
    console.error('Error in uploadProductImages:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



export const deleteProductImage = async (req, res) => {
  const imageId = Number(req.params.imageId);
  try {
    const ok = await productService.deleteImage(imageId);
    if (!ok) return res.status(404).json({ message: 'Image not found' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

