import { prisma } from '../../config/db.js';

let ensuredFavouriteTable = false;

async function ensureFavouriteTable() {
  if (ensuredFavouriteTable) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Favourite" (
      "id" SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL,
      "hotelId" TEXT NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      CONSTRAINT favourite_user_hotel_unique UNIQUE ("userId", "hotelId")
    )
  `);
  await prisma.$executeRawUnsafe(
    `DO $$
     BEGIN
       IF NOT EXISTS (
         SELECT 1 FROM pg_constraint
         WHERE conname = 'favourite_user_hotel_unique'
       ) THEN
         ALTER TABLE "Favourite" ADD CONSTRAINT favourite_user_hotel_unique UNIQUE ("userId", "hotelId");
       END IF;
     END $$;`
  );

  ensuredFavouriteTable = true;
}

export const FavouriteModel = {
  async create(data) {
    await ensureFavouriteTable();
    return prisma.favourite.create({ data });
  },
  async remove(userId, hotelId) {
    await ensureFavouriteTable();
    return prisma.favourite.deleteMany({ where: { userId, hotelId } });
  },
  async findByUser(userId) {
    await ensureFavouriteTable();
    return prisma.favourite.findMany({ where: { userId } });
  },
  async findByUserAndHotel(userId, hotelId) {
    await ensureFavouriteTable();
    return prisma.favourite.findFirst({ where: { userId, hotelId } });
  },
};

