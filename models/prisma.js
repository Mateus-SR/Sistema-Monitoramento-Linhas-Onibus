import { PrismaClient } from '@prisma/client';

// Previne múltiplas instâncias do PrismaClient em desenvolvimento (com hot-reload)
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Opcional: logar as queries no console
    // log: ['query'], 
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Prisma pode ser carregado diretamente sem previnir varias instancias com esse comando:
// export const prisma = new PrismaClient();