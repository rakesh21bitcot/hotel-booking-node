import express  from "express";
import dotenv from "dotenv";
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import hotelRoutes from './modules/hotel/hotel.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import bookingRoutes from './modules/booking/booking.routes.js';
import favouriteRoutes from './modules/favourite/favourite.routes.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', hotelRoutes);
app.use('/', profileRoutes);
app.use('/', settingsRoutes);
app.use('/', bookingRoutes);
app.use('/', favouriteRoutes);


export default app;