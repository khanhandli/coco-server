import mongoose from 'mongoose';

const type = {
    name: {
        type: String,
    },
    image: {
        type: String,
        default: 'https://res.cloudinary.com/hunre/image/upload/v1650680842/cocoshop/set_lbjbf7.png',
    },
    promotion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'promotion',
    },
};

const type2 = {
    name: {
        type: String,
    },
    image: {
        type: String,
        default: 'https://res.cloudinary.com/hunre/image/upload/v1650682427/cocoshop/bg-home_o33s6t.png',
    },
    promotion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'promotion',
    },
};

const bannerSchema = new mongoose.Schema({
    data: {
        banner_1: { ...type },
        banner_2: { ...type },
        banner_3: { ...type2 },
        banner_4: { ...type2 },
        banner_5: { ...type2 },
        banner_6: { ...type2 },
        banner_7: { ...type },
        banner_8: { ...type },
    },
});

const exploreSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    image: {
        type: String,
    },
    promotion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'promotion',
    },
});

const promotionSchema = new mongoose.Schema({
    name: {
        type: String,
    },
});

// const model = {
//   bannerModel: mongoose.model("banner", bannerSchema),
//   exploreModel: mongoose.model("explore", exploreSchema),
// };

export const bannerModel = mongoose.model('banner', bannerSchema);
export const exploreModel = mongoose.model('explore', exploreSchema);
export const promotionModel = mongoose.model('promotion', promotionSchema);

// export default model;
