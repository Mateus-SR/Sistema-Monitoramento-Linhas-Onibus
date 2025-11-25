const { PrismaClient } = require('@prisma/client');

// Previne múltiplas instâncias do PrismaClient em desenvolvimento (com hot-reload)
const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Opcional: logar as queries no console
    // log: ['query'], 
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
  
  module.exports = { prisma };

// Prisma pode ser carregado diretamente sem previnir varias instancias com esse comando:
// export const prisma = new PrismaClient();