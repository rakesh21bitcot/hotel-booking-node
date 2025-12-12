import express  from "express";
import dotenv from "dotenv";
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import hotelRoutes from './modules/hotel/hotel.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import bookingRoutes from './modules/booking/booking.routes.js';
import favouriteRoutes from './modules/favourite/favourite.routes.js';
import contactRoutes from './modules/contact/contact.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

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
app.use('/', contactRoutes);

// 404 and error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;