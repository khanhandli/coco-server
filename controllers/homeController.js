import { bannerModel, exploreModel, promotionModel } from '../models/homeModel.js';

const homeController = {
    getPromotion: async (req, res) => {
        try {
            const promotion = await promotionModel.find();

            res.status(200).json(promotion);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getBanner: async (req, res) => {
        try {
            const banner = await bannerModel.find();
            res.status(200).json(banner);
        } catch (error) {
            res.status(500).json({
                message: 'Error while getting banner',
                error: error,
            });
        }
    },
    getExplore: async (req, res) => {
        try {
            const explore = await exploreModel.find().populate('promotion');
            res.status(200).json(explore);
        } catch (error) {
            res.status(500).json({
                message: 'Error while getting explore',
                error: error,
            });
        }
    },
    findByIdExplore: async (req, res) => {
        try {
            const explore = await exploreModel.findById(req.params.id).populate('promotion');
            res.status(200).json(explore);
        } catch (error) {
            res.status(500).json({
                message: 'Error while getting explore',
                error: error,
            });
        }
    },
    createPromotion: async (req, res) => {
        try {
            await promotionModel.create(req.body);
            res.status(200).json({ msg: 'Thêm khuyến mại thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Error while creating promotion',
                error: error,
            });
        }
    },
    updateBanner: async (req, res) => {
        try {
            await bannerModel.findByIdAndUpdate(req.params.id, req.body);
            res.status(200).json({ msg: 'Cập nhật banner thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Error while updating banner',
                error: error,
            });
        }
    },

    createExplore: async (req, res) => {
        try {
            await exploreModel.create(req.body);
            res.status(200).json({ msg: 'Thêm khám phá thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Error while creating explore',
                error: error,
            });
        }
    },
    updateExplore: async (req, res) => {
        try {
            await exploreModel.findByIdAndUpdate(req.params.id, req.body);
            res.status(200).json({ msg: 'Cập nhật thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Error while updating explore',
                error: error,
            });
        }
    },
    deleteExplore: async (req, res) => {
        try {
            await exploreModel.findByIdAndDelete(req.params.id);
            res.status(200).json({ msg: 'Xóa thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Error while deleting explore',
                error: error,
            });
        }
    },
    updatePromotion: async (req, res) => {
        try {
            await promotionModel.findByIdAndUpdate(req.params.id, req.body);
            res.status(200).json({ msg: 'Cập nhật thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Error while updating promotion',
                error: error,
            });
        }
    },
    deletePromotion: async (req, res) => {
        try {
            await promotionModel.findByIdAndDelete(req.params.id);
            res.status(200).json({ msg: 'Xóa thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Error while deleting promotion',
                error: error,
            });
        }
    },
    getAllPromotion: async (req, res) => {
        try {
            const banners = await bannerModel.find();
            const explores = await exploreModel.find().populate('promotion');
            res.status(200).json({ banners, explores });
        } catch (error) {
            res.status(500).json({
                message: 'Error while getting promotion',
                error: error.message,
            });
        }
    },
};

export default homeController;
