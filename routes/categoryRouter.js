import express from 'express';
// import auth from '../middleware/auth'
import categoryRouter from '../controllers/categoryController.js';

const router = express.Router();

router.route('/category').get(categoryRouter.get).post(categoryRouter.store);

router.route('/category/:id').get(categoryRouter.getById).put(categoryRouter.update).delete(categoryRouter.delete);

router.route('/all_category').get(categoryRouter.getAllCategory);

export default router;
