import dotenv from 'dotenv';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { createServer } from 'http';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import Comments from './models/commentModel.js';
import Notifications from './models/notificationModel.js';

// import { Server, Socket } from "socket.io";

const app = express();
dotenv.config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
    cors({
        origin: [`${process.env.BASE_URL}`, `${process.env.CLIENT_URL}`],
        credentials: true,
    })
);
app.use(cookieParser());

app.use('/api', routes);
// // socket io
const http = createServer(app);
const _socket = new Server(http);
let users = [];
_socket.on('connection', (socket) => {
    socket.on('joinRoom', (id) => {
        const user = { userId: socket.id, room: id };

        const check = users.every((user) => user.userId !== socket.id);

        if (check) {
            users.push(user);
            socket.join(user.room);
        } else {
            users.map((user) => {
                if (user.userId === socket.id) {
                    if (user.room !== id) {
                        socket.leave(user.room);
                        socket.join(id);
                        user.room = id;
                    }
                }
            });
        }
    });

    socket.on('createComment', async (msg) => {
        const { username, content, product_id, createdAt, rating, send, avatar, product_name } = msg;

        const newComment = new Comments({
            username,
            content,
            avatar,
            product_id,
            createdAt,
            rating,
        });

        if (send === 'replyComment') {
            const { _id, username, content, product_id, createdAt, rating } = newComment;
            const comment = await Comments.findById(product_id);

            if (comment) {
                comment.reply.push({ _id, username, avatar, content, createdAt, rating });

                await comment.save();
                _socket.to(comment.product_id).emit('sendReplyCommentToClient', comment);
            }
        } else {
            await newComment.save();

            _socket.to(newComment.product_id).emit('sendCommentToClient', newComment);
        }

        if (rating) {
            const newNoti = new Notifications({
                img: avatar,
                title: handleTitleNotification(
                    {
                        name: username,
                        desc: 'đã đánh giá ' + rating + ' sao cho sản phẩm ',
                        title: `<b><a target="_blank" href="https://cocoshopclient.tk/shop/detail/${product_id}">${product_name}</a></b>`,
                    },
                    2
                ),
            });
            await newNoti.save();
        }
    });

    socket.on('disconnect', () => {
        users = users.filter((user) => user.userId !== socket.id);
    });
});

// Routes

// database
import './config/database.js';
import { handleTitleNotification } from './config/common.js';

// server port
const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
    console.log('server runing: ', PORT);
});
