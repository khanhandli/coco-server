import express from 'express';
import PaymentController from '../controllers/paymentController.js';
import auth from '../middleware/auth.js';
const router = express.Router();

router.route('/payment').get(PaymentController.getPayments).post(auth, PaymentController.createPayment);

router.route('/payment/:id').patch(PaymentController.updatePayment).delete(PaymentController.deletePayment);

export default router;
