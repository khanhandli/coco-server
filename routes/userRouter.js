import express from 'express';
import userController from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import authAdmin from '../middleware/authAdmin.js';

const router = express.Router();

router.post('/register', userController.register);

router.post('/activation', userController.activateEmail);

router.post('/login', userController.login);

router.get('/logout', userController.logout);

router.get('/refresh_token', userController.refreshToken);

router.get('/infor', auth, userController.getUser);

router.get('/inforUser', auth, userController.getUserInfor);

router.patch('/addcart', auth, userController.addCart);

router.patch('/addship', auth, userController.addShipping);

router.patch('/addFavorite', auth, userController.addFavorite);

router.get('/history', auth, userController.history);

router.post('/forgot', userController.forgotPassword);

router.post('/reset', auth, userController.resetPassword);

router.get('/infor', auth, userController.getUserInfor);

router.get('/all_infor', auth, authAdmin, userController.getUsersAllInfor);

router.get('/allInfor', userController.getUsersAllInfor);

router.patch('/update', auth, userController.updateUser);

router.patch('/update_role/:id', auth, authAdmin, userController.updateUsersRole);

router.delete('/delete/:id', auth, authAdmin, userController.deleteUser);

// Social Login
router.post('/google_login', userController.googleLogin);

router.post('/facebook_login', userController.facebookLogin);

export default router;
