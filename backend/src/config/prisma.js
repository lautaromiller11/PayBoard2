const { PrismaClient } = require('@prisma/client');

// Create a single PrismaClient instance to be reused across the app
const prisma = new PrismaClient();

module.exports = prisma;


