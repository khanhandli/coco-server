import express from 'express';
// import auth from '../middleware/auth'
import homeController from '../controllers/homeController.js';

const router = express.Router();

router.route('/home_banner').get(homeController.getBanner);
router.route('/home_banner/:id').patch(homeController.updateBanner);

router.route('/home_explore').get(homeController.getExplore).post(homeController.createExplore);
router
    .route('/home_explore/:id')
    .get(homeController.findByIdExplore)
    .put(homeController.updateExplore)
    .delete(homeController.deleteExplore);

router.route('/home_promotion').get(homeController.getPromotion).post(homeController.createPromotion);
router.route('/home_promotion/:id').put(homeController.updatePromotion).delete(homeController.deletePromotion);

router.route('/promotion').get(homeController.getAllPromotion);

export default router;
