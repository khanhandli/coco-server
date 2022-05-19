import Posts from '../models/postModel.js';

const postController = {
    get: async (req, res) => {
        try {
            const post = await Posts.find();
            res.status(200).json(post);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getById: async (req, res) => {
        try {
            const post = await Posts.findById(req.params.id);
            res.status(200).json(post);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    create: async (req, res) => {
        try {
            await Posts.create(req.body);
            res.status(200).json({ msg: 'Thêm bài viết thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Error while creating post',
                error: error,
            });
        }
    },
    update: async (req, res) => {
        try {
            await Posts.findByIdAndUpdate(req.params.id, req.body);
            res.status(200).json({ msg: 'Cập nhật bài viết thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Error while updating post',
                error: error,
            });
        }
    },
    delete: async (req, res) => {
        try {
            await Posts.findByIdAndDelete(req.params.id);
            res.status(200).json({ msg: 'Xóa bài viết thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Error while deleting post',
                error: error,
            });
        }
    },
};

export default postController;
