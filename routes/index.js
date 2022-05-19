import homeRouter from './homeRouter.js';
import categoryRouter from './categoryRouter.js';
import productRouter from './productRouter.js';
import authRouter from './userRouter.js';
import postRouter from './postRouter.js';
import paymentRouter from './paymentRouter.js';

const routes = [homeRouter, categoryRouter, productRouter, authRouter, postRouter, paymentRouter];

export default routes;
