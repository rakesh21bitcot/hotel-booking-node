import express  from "express";
import dotenv from "dotenv";
import cors from "cors";
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

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
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