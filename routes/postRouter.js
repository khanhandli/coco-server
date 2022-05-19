import express from 'express';
import postController from '../controllers/postController.js';

const router = express.Router();

router.route('/post').get(postController.get).post(postController.create);
router.route('/post/:id').get(postController.getById).put(postController.update).delete(postController.delete);

export default router;
