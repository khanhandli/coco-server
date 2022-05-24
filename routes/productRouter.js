import express from 'express';
// import auth from '../middleware/auth'
import productController from '../controllers/productController.js';

const router = express.Router();

router.route('/product').get(productController.get).post(productController.create);

router
    .route('/product/:id')
    .get(productController.getById)
    .put(productController.update)
    .patch(productController.reviews)
    .delete(productController.delete);

router.route('/product/report').post(productController.reportStatistics);

export default router;
