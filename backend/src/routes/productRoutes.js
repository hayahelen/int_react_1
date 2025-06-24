import express from 'express';
import multer from 'multer';
import path from 'path';
import upload from '../middleweare/upload.js';

import * as productController from "../controllers/productController.js"

const router = express.Router();




router.get('/products', productController.getAllProducts);
router.get('/products/search', productController.searchProducts);
router.get('/products/:id', productController.getProductDetails);


router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);


router.delete('/products/:id', productController.deleteProduct);


//images
router.post('/products/:id/images', upload.array('images', 20), productController.uploadProductImages);
router.delete('/products/:id/images/:imageId', productController.deleteProductImage);




export default router;