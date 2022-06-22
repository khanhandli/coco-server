import Users from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Payments from '../models/paymentModel.js';
import sendMail from './sendMail.js';

import { google } from 'googleapis';
import fetch from 'node-fetch';
import env from 'dotenv';
env.config();

const { OAuth2 } = google.auth;
const client = new OAuth2(process.env.MAILING_SERVICE_CLIENT_ID);
const { CLIENT_URL } = process.env;

const userController = {
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) return res.status(400).json({ msg: 'Hãy nhập hêt thông tin.' });

            if (!validateEmail(email)) return res.status(400).json({ msg: 'Email không đúng.' });

            const user = await Users.findOne({ email });
            if (user) return res.status(400).json({ msg: 'Email tồn tại.' });

            if (password.length < 6) return res.status(400).json({ msg: 'Mật khẩu tối thiểu 6 kí tự.' });

            const passwordHash = await bcrypt.hash(password, 12);

            const newUser = {
                name,
                email,
                password: passwordHash,
            };

            const activation_token = createActivationToken(newUser);

            const url = `${CLIENT_URL}/user/activate?token=${activation_token}`;
            sendMail(email, url, 'Verify your email address');

            res.json({ msg: 'Đăng ký thành công, vào email để xác thực.' });
        } catch (err) {
            return res.status(500).json({ msgerr: err.message });
        }
    },
    activateEmail: async (req, res) => {
        try {
            const { activation_token } = req.body;
            const user = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN_SECRET);

            const { name, email, password } = user;

            const check = await Users.findOne({ email });
            if (check) return res.status(400).json({ msg: 'Email đã tồn tại.' });

            const newUser = new Users({
                name,
                email,
                password,
            });

            // function start(io) {
            //     io.on('connection', function (socket) {
            //         socket.emit('createNotification', {
            //             name,
            //             action: 'register',
            //             createdAt: new Date(),
            //         });
            //     });
            // }

            await newUser.save();

            res.json({ newUser, msg: 'Tài khoản đã được xác thực!' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await Users.findOne({ email });
            if (!user) return res.status(400).json({ msg: 'Email không chính xác.' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ msg: 'Mật khẩu không chính xác.' });

            const refresh_token = createRefreshToken({ id: user._id });
            const accesstoken = createAccessToken({ id: user._id });

            res.cookie(`refreshtoken`, `${refresh_token}`, {
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                expires: new Date('01 12 2021'),
                secure: true,
                httpOnly: true,
                path: `/api/refresh_token`,
                sameSite: 'none',
            });

            res.json({ msg: 'Đăng nhập thành công!', accesstoken });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getAccessToken: (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken;
            if (!rf_token) return res.status(400).json({ msg: 'Đăng nhập ngay bây giờ!' });

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) return res.status(400).json({ msg: 'Đăng nhập ngay bây giờ!' });

                const access_token = createAccessToken({ id: user.id });
                res.json({ access_token });
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await Users.findOne({ email });
            if (!user) return res.status(400).json({ msg: 'Email không tồn tại.' });

            const access_token = createAccessToken({ id: user._id });
            const url = `${CLIENT_URL}/user/reset/${access_token}`;

            sendMail(email, url, 'Đổi mật khẩu');
            res.json({ msg: 'Đã gửi mật khẩu tới email!Check ngay.' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    resetPassword: async (req, res) => {
        try {
            const { password } = req.body;
            const passwordHash = await bcrypt.hash(password, 12);

            await Users.findOneAndUpdate(
                { _id: req.user.id },
                {
                    password: passwordHash,
                }
            );

            res.json({ msg: 'Đổi mật khẩu thành công!' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getUserInfor: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id).select('-password');
            res.json(user);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getUsersAllInfor: async (req, res) => {
        try {
            const users = await Users.find().select('-password');

            res.json(users);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', { path: '/user/refresh_token' });

            return res.json({ msg: 'Logout succes' });
        } catch (err) {
            return res.status(500).json({ msgerr: err.message });
        }
    },
    updateUser: async (req, res) => {
        try {
            const { name, avatar, info_ship } = req.body;
            if (info_ship) {
                await Users.findOneAndUpdate(
                    { _id: req.user.id },
                    {
                        info_ship,
                    }
                );
            } else {
                await Users.findOneAndUpdate(
                    { _id: req.user.id },
                    {
                        name,
                        avatar,
                    }
                );
            }

            res.json({ msg: 'Cập nhật thành công!' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateUsersRole: async (req, res) => {
        try {
            const { role } = req.body;

            await Users.findOneAndUpdate(
                { _id: req.params.id },
                {
                    role,
                }
            );

            res.json({ msg: 'Cập nhật thành công!' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    deleteUser: async (req, res) => {
        try {
            await Users.findByIdAndDelete(req.params.id);

            res.json({ msg: 'Xóa thành công!' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    refreshToken: (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken;

            if (!rf_token) return res.status(400).json({ msg: 'Đăng nhập hoặc đăng kí 1.' });

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
                if (err) return res.status(400).json({ msg: 'Đăng nhập hoặc đăng kí 2.' });

                const accesstoken = createAccessToken({ id: user.id });
                // find user by id
                const user_ = await Users.findById(user.id);

                res.json({ accesstoken, user: user_ });
            });
        } catch (err) {
            return res.status(500).json({ msgerr: err.message });
        }
    },
    getUser: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id).select('-password');
            if (!user) return res.status(400).json({ msgerr: 'User không tồn tại.' });

            res.json(user);
        } catch (err) {
            return res.status(500).json({ msgerr: err.message });
        }
    },
    addCart: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id);
            if (!user) return res.status(400).json({ msg: 'User không tồn tại.' });

            await Users.findOneAndUpdate(
                { _id: req.user.id },
                {
                    cart: req.body.cart,
                }
            );

            return res.json({ msg: 'Thêm vào giỏ hàng.' });
        } catch (err) {
            return res.status(500).json({ msgerr: err.message });
        }
    },
    addShipping: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id);
            if (!user) return res.status(400).json({ msg: 'User không tồn tại.' });

            await Users.findOneAndUpdate(
                { _id: req.user.id },
                {
                    shipping: req.body.shipping,
                }
            );

            return res.json({ msg: 'Thêm vào giỏ hàng.' });
        } catch (err) {
            return res.status(500).json({ msgerr: err.message });
        }
    },
    updateUser: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id);
            if (!user) return res.status(400).json({ msg: 'User không tồn tại.' });
            const { name, description, name_ship, phone_ship, address_ship } = req.body;

            await Users.findOneAndUpdate(
                { _id: req.user.id },
                {
                    name,
                    description,
                    shipping: {
                        name: name_ship,
                        phone: phone_ship,
                        address: address_ship,
                    },
                }
            );
            res.json({ msg: 'Cập nhật thành công!' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateRole: async (req, res) => {
        try {
            const { role, id } = req.body;
            await Users.findOneAndUpdate(
                { _id: id },
                {
                    role,
                }
            );
            return;
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    addFavorite: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id);
            if (!user) return res.status(400).json({ msg: 'User không tồn tại.' });

            await Users.findOneAndUpdate(
                { _id: req.user.id },
                {
                    favorites: req.body.favorites,
                }
            );

            return res.json({ msg: 'Thêm vào yêu thích.' });
        } catch (err) {
            return res.status(500).json({ msgerr: err.message });
        }
    },
    history: async (req, res) => {
        try {
            const history = await Payments.find({ user_id: req.user.id });
            const { type } = req.query;

            let returnHistory;

            // remove key detail from cart in history
            const history_ = history.map((item) => {
                // remove key detail from cart in item
                const item_ = {
                    ...item._doc,
                    cart: item.cart.map((carts) => {
                        return {
                            ...carts,
                            detail: undefined,
                            key: carts._id + Math.random().toString(),
                            id_product: item._doc._id,
                        };
                    }),
                };

                return item_;
            });

            if (type == 1) {
                // remove cart from history
                returnHistory = history_.map((item) => {
                    return {
                        ...item,
                        key: item._id,
                        cart: item.cart,
                    };
                });
            } else {
                returnHistory = history_.map((item) => {
                    return item.cart;
                });

                // flat returnHistory
                returnHistory = [].concat(...returnHistory);
            }

            res.json(returnHistory);
        } catch (err) {
            return res.status(500).json({ msgerr: err.message });
        }
    },
    updateAvatar: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id);
            if (!user) return res.status(400).json({ msg: 'User không tồn tại.' });

            await Users.findOneAndUpdate(
                { _id: req.user.id },
                {
                    avatar: req.body.avatar,
                }
            );

            return res.json({ msg: 'Cập nhật avatar thành công.' });
        } catch (err) {
            return res.status(500).json({ msgerr: err.message });
        }
    },
    googleLogin: async (req, res) => {
        try {
            const { tokenId } = req.body;

            const verify = await client.verifyIdToken({
                idToken: tokenId,
                audience: process.env.MAILING_SERVICE_CLIENT_ID,
            });

            const { email_verified, email, name, picture } = verify.payload;

            const password = email + process.env.GOOGLE_SECRET;

            const passwordHash = await bcrypt.hash(password, 12);

            if (!email_verified) return res.status(400).json({ msg: 'Email verification failed.' });

            const user = await Users.findOne({ email });

            if (user) {
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) return res.status(400).json({ msg: 'Password is incorrect.' });

                const refresh_token = createRefreshToken({ id: user._id });
                res.cookie('refreshtoken', refresh_token, {
                    sameSite: 'none',
                    secure: true,
                    httpOnly: true,
                    path: '/user/refresh_token',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                });

                res.json({ msg: 'Đăng nhập thành công' });
            } else {
                const newUser = new Users({
                    name,
                    email,
                    password: passwordHash,
                    avatar: picture,
                });

                await newUser.save();

                const refresh_token = createRefreshToken({ id: newUser._id });
                res.cookie('refreshtoken', refresh_token, {
                    sameSite: 'none',
                    secure: true,
                    httpOnly: true,
                    path: '/user/refresh_token',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                });

                res.json({ msg: 'Đăng nhập thành công' });
            }
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    facebookLogin: async (req, res) => {
        try {
            const { accessToken, userID } = req.body;

            const URL = `https://graph.facebook.com/v2.9/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`;

            const data = await fetch(URL)
                .then((res) => res.json())
                .then((res) => {
                    return res;
                });

            const { email, name, picture } = data;

            const password = email + process.env.FACEBOOK_SECRET;

            const passwordHash = await bcrypt.hash(password, 12);

            const user = await Users.findOne({ email });

            if (user) {
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) return res.status(400).json({ msg: 'Password is incorrect.' });

                const refresh_token = createRefreshToken({ id: user._id });
                res.cookie('refreshtoken', refresh_token, {
                    sameSite: 'none',
                    secure: true,
                    httpOnly: true,
                    path: '/user/refresh_token',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                });

                res.json({ msg: 'Đăng nhập thành công' });
            } else {
                const newUser = new Users({
                    name,
                    email,
                    password: passwordHash,
                    avatar: picture.data.url,
                });

                await newUser.save();

                const refresh_token = createRefreshToken({ id: newUser._id });
                res.cookie('refreshtoken', refresh_token, {
                    sameSite: 'none',
                    secure: true,
                    httpOnly: true,
                    path: '/user/refresh_token',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                });
                res.json({ msg: 'Đăng nhập thành công' });
            }
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

function validateEmail(email) {
    const re =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

const createActivationToken = (payload) => {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, { expiresIn: '5m' });
};

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '60m' });
};

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

export default userController;
