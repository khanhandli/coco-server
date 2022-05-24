import Notifications from '../models/notificationModel.js';
class APIFeature {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filtering() {
        const queryObj = { ...this.queryString }; //queryString= req.query
        // console.log({ before: queryObj }) // before delete page

        const excludedFields = ['page', 'sort', 'limit'];
        excludedFields.forEach((el) => delete queryObj[el]);

        // console.log({ after: queryObj }) // after delete page

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, (match) => '$' + match);

        //gte = greater than or equal
        //lte = lesser than or equal
        //lt = lesser than
        //gt  = greater than
        this.query.find(JSON.parse(queryStr));

        return this;
    }

    sorting() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');

            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    paginating() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 8;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

const notificationController = {
    getNotis: async (req, res) => {
        try {
            const noti = new APIFeature(Notifications.find(), req.query).filtering().sorting().paginating();

            const notis = await noti.query;
            const totalNoti = (await Notifications.find()).length;

            res.json({ data: notis, total: totalNoti });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // deletePayment: async (req, res) => {
    //     try {
    //         const { id } = req.params;
    //         const payment = await Payments.findById(id);
    //         if (!payment) return res.status(400).json({ msg: 'Không tìm thấy giao dịch' });

    //         // find id and delete payment
    //         await Payments.findOneAndDelete({ _id: id });

    //         res.json({ msg: 'Xóa thành công' });
    //     } catch (err) {
    //         return res.status(500).json({ msg: err.message });
    //     }
    // },
};

export default notificationController;
