import { successResponse } from '../../utils/response.util.js';
import { FavouriteService } from './favourite.service.js';

export const FavouriteController = {
  async add(req, res, next) {
    try {
      const userId = req.user?.id ?? req.body.userId;
      const { hotelId } = req.body;
      const favourite = await FavouriteService.addFavourite(userId, hotelId);
      return successResponse(res, 'Added to favourites', { favourite }, 201);
    } catch (err) {
      return next(err);
    }
  },

  async list(req, res, next) {
    try {
      const userId = req.user?.id;
      const favourites = await FavouriteService.listFavourites(userId);
      return successResponse(res, 'Favourites', { favourites }, 200);
    } catch (err) {
      return next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const userId = req.user?.id ?? req.body.userId;
      const { hotelId } = req.params;
      await FavouriteService.removeFavourite(userId, hotelId);
      return successResponse(res, 'Removed from favourites', {}, 200);
    } catch (err) {
      return next(err);
    }
  },
};

