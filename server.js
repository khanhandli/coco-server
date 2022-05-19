import dotenv from 'dotenv';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { createServer } from 'http';
import bodyParser from 'body-parser';

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

// // socket io
const http = createServer(app);
// export const io = new Server(http, {
//   cors: {
//     origin: `${process.env.BASE_URL}`,
//     credentials: true,
//   },
// });
// import { SocketServer } from "./config/socket";

// io.on("connection", (socket) => SocketServer(socket));

// Routes
app.use('/api', routes);

// database
import './config/database.js';

// server port
const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
    console.log('server runing: ', PORT);
});
