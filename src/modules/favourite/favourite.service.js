import { FavouriteModel } from './favourite.model.js';
import { HotelService } from '../hotel/hotel.service.js';

export const FavouriteService = {
  async addFavourite(userId, hotelId) {
    if (!userId) {
      const err = new Error('User not authenticated');
      err.name = 'ValidationError';
      err.status = 401;
      throw err;
    }
    if (!hotelId) {
      const err = new Error('Hotel id is required');
      err.name = 'ValidationError';
      err.status = 400;
      throw err;
    }

    const hotelIdStr = String(hotelId);

    // Ensure hotel exists before creating favourite
    await HotelService.getHotelById(hotelIdStr);

    const existing = await FavouriteModel.findByUserAndHotel(userId, hotelIdStr);
    if (existing) return existing;

    return FavouriteModel.create({ userId, hotelId: hotelIdStr });
  },

  async listFavourites(userId) {
    if (!userId) {
      const err = new Error('User not authenticated');
      err.name = 'ValidationError';
      err.status = 401;
      throw err;
    }

    const favs = await FavouriteModel.findByUser(userId);

    const enriched = await Promise.all(
      favs.map(async (fav) => {
        let hotel = null;
        try {
          hotel = await HotelService.getHotelById(fav.hotelId);
        } catch (err) {
          hotel = null;
        }
        return { ...fav, hotel };
      })
    );

    return enriched;
  },

  async removeFavourite(userId, hotelId) {
    if (!userId) {
      const err = new Error('User not authenticated');
      err.name = 'ValidationError';
      err.status = 401;
      throw err;
    }
    if (!hotelId) {
      const err = new Error('Hotel id is required');
      err.name = 'ValidationError';
      err.status = 400;
      throw err;
    }

    const hotelIdStr = String(hotelId);
    const result = await FavouriteModel.remove(userId, hotelIdStr);
    if (!result || result.count === 0) {
      const err = new Error('Favourite not found');
      err.name = 'NotFoundError';
      err.status = 404;
      throw err;
    }
    return { success: true };
  },
};

