import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
        },
        img: {
            type: String,
        },
        view: {
            type: String,
            default: 'user',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('notification', notificationSchema);
