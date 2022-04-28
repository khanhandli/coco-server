import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'category',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('category', categorySchema);
