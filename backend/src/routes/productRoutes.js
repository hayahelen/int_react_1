import express from 'express';

import * as productController from "../controllers/productController.js"

const router = express.Router();


router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);


export default router;