import APIFeature from '../config/APIFeature.js';
import Categories from '../models/categoryModel.js';

const categoryController = {
    get: async (req, res) => {
        try {
            const categories = await Categories.find().populate('parent');

            const list = categories.map((category) => {
                if (!category._doc.parent) {
                    return {
                        ...category._doc,
                        title: category._doc.name,
                        key: category._doc._id.toString(),
                        children: categories
                            .filter((c) => c._doc?.parent?._id.toString() == category._doc?._id.toString())
                            .map((item) => {
                                return {
                                    ...item._doc,
                                    title: item._doc.name,
                                    key: item._doc._id.toString(),
                                };
                            }),
                    };
                }
            });

            const listFilter = list.filter((c) => c);
            listFilter.forEach((c) => {
                if (!(c?.children?.length > 0)) {
                    delete c['children'];
                }
            });

            res.status(200).json(listFilter);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getAllCategory: async (req, res) => {
        try {
            // const feature = new APIFeature(Categories.find().populate('parent'), req.query)
            //     .sorting()
            //     .filtering()
            //     .paginating();

            // const categories = await feature.query;
            const categories = await Categories.find().populate('parent');
            res.status(200).json(categories);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getById: async (req, res) => {
        try {
            const category = await Categories.findById({ _id: req.params.id }).populate('parent');

            res.status(200).json(category);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    store: async (req, res) => {
        try {
            await Categories.create({ name: req.body.name.toLowerCase(), parent: req.body.parent });

            res.status(200).json({ msg: 'Thêm thành công' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    update: async (req, res) => {
        try {
            await Categories.findByIdAndUpdate(req.params.id, {
                name: req.body.name.toLowerCase(),
                parent: req.body.parent === '' ? null : req.body.parent,
            });

            res.status(200).json({ msg: 'Cập nhật thành công' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    delete: async (req, res) => {
        try {
            await Categories.findByIdAndDelete(req.params.id);

            res.status(200).json({ msg: 'Xóa thành công' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

export default categoryController;
