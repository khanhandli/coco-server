import productModel from '../models/productModel.js';
import Payments from '../models/paymentModel.js';
import Users from '../models/userModel.js';
import Notifications from '../models/notificationModel.js';
import { handleTitleNotification } from '../config/common.js';

const productController = {
    get: async (req, res) => {
        try {
            const product = await productModel.find().populate('category').populate('promotion');
            res.status(200).json(product);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getById: async (req, res) => {
        try {
            const product = await productModel.findById(req.params.id);
            res.status(200).json(product);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    create: async (req, res) => {
        try {
            await productModel.create(req.body);
            res.status(200).json({ msg: 'Thêm sản phẩm thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Error while creating product',
                error: error,
            });
        }
    },
    update: async (req, res) => {
        try {
            await productModel.findByIdAndUpdate(req.params.id, req.body);
            res.status(200).json({ msg: 'Cập nhật sản phẩm thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Error while updating product',
                error: error,
            });
        }
    },
    delete: async (req, res) => {
        try {
            await productModel.findByIdAndDelete(req.params.id);
            res.status(200).json({ msg: 'Xóa sản phẩm thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Error while deleting product',
                error: error,
            });
        }
    },
    reportStatistics: async (req, res) => {
        try {
            const products = await productModel.find({
                createdAt: {
                    $gte: new Date(req.body.startDate),
                    $lte: new Date(req.body.endDate),
                },
            });
            const payments = await Payments.find({
                createdAt: {
                    $gte: new Date(req.body.startDate),
                    $lte: new Date(req.body.endDate),
                },
            });

            const users = await Users.find({
                createdAt: {
                    $gte: new Date(req.body.startDate),
                    $lte: new Date(req.body.endDate),
                },
            });

            const history = await Payments.find({
                createdAt: {
                    $gte: new Date(req.body.startDate),
                    $lte: new Date(req.body.endDate),
                },
            });

            const history_ = history.map((item) => {
                return item.cart;
            });

            res.status(200).json({ products, payments, users, history_ });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    reviews: async (req, res) => {
        try {
            const { rating } = req.body;
            if (rating && rating !== 0) {
                const product = await productModel.findById(req.params.id);
                if (!product) return res.status(400).json({ msg: 'Sản Phẩm Không Tồn Tại.' });

                let num = product.numReviewers;
                let rate = product.rating;

                await productModel.findOneAndUpdate(
                    { _id: req.params.id },
                    {
                        rating: rate + rating,
                        numReviewers: num + 1,
                    }
                );

                res.json({ msg: 'Cập nhật thành công' });
            }
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

export default productController;
