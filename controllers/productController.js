import productModel from '../models/productModel.js';

const productController = {
    get: async (req, res) => {
        try {
            const product = await productModel.find().populate('category');
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
};

export default productController;
