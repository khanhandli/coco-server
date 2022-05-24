import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
        username: String,
        avatar: String,
        content: String,
        product_id: String,
        rating: {
            type: Number,
            default: 0,
        },
        reply: Array,
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Comments', commentSchema);
