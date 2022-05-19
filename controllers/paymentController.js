import Payments from '../models/paymentModel.js';
import Users from '../models/userModel.js';
import Products from '../models/productModel.js';
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

const paymentController = {
    getPayments: async (req, res) => {
        try {
            const payment = new APIFeature(Payments.find(), req.query).filtering();

            const payments = await payment.query;
            res.json(payments);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updatePayment: async (req, res) => {
        try {
            const { id } = req.params;
            const payment = await Payments.findById(id);
            if (!payment) return res.status(400).json({ msg: 'Không tìm thấy giao dịch' });

            const { status } = req.body;

            // find id and update payment
            await Payments.findOneAndUpdate(
                { _id: id },
                {
                    status,
                }
            );

            res.json({ msg: 'Chuyển trạng thái thành công' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    deletePayment: async (req, res) => {
        try {
            const { id } = req.params;
            const payment = await Payments.findById(id);
            if (!payment) return res.status(400).json({ msg: 'Không tìm thấy giao dịch' });

            // find id and delete payment
            await Payments.findOneAndDelete({ _id: id });

            res.json({ msg: 'Xóa thành công' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    createPayment: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id).select('username email');

            if (!user) return res.status(400).json({ msg: 'User không tồn tại.' });

            const { cart, address, priceCheckout, name, phone, type, quantity } = req.body;
            const { _id, email } = user;
            const newPayment = new Payments({
                user_id: _id,
                name,
                phone,
                email,
                address,
                cart,
                priceCheckout,
                status: type === 'payment' ? '2' : '1',
                type,
            });

            cart.filter((item) => {
                return sold(item._id, item.quantity_cart, item.sold, item.quantity);
            });

            await newPayment.save();

            res.json({ msg: 'Đặt hàng thành công!' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

const sold = async (id, quantity_cart, oldSold, quantity) => {
    await Products.findOneAndUpdate(
        { _id: id },
        {
            sold: quantity_cart + (oldSold || 0),
            quantity: quantity - 1,
        }
    );
};

export default paymentController;
