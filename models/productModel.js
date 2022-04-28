import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
    },
    image: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
    },
    promotion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'promotion',
    },
    status: {
        type: String,
        default: 'Còn hàng',
    },
    quantity: {
        type: Number,
        default: 0,
    },
});

export default mongoose.model('product', productSchema);
