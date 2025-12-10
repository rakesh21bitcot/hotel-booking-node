import { Router } from 'express';
import { FavouriteController } from './favourite.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/favourite', authenticate, FavouriteController.add);
router.get('/favourite', authenticate, FavouriteController.list);
router.delete('/favourite/:hotelId', authenticate, FavouriteController.remove);

export default router;

