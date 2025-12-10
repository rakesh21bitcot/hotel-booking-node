import { prisma } from '../../config/db.js';

let ensuredContactTable = false;

async function ensureContactTable() {
  if (ensuredContactTable) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Contact" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  ensuredContactTable = true;
}

export const ContactModel = {
  async create(data) {
    await ensureContactTable();
    return prisma.contact.create({ data });
  },
};

