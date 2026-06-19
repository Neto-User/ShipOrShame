import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

// Reuse a single PrismaClient across hot reloads in dev to avoid exhausting
// the connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// SvelteKit/Vite load .env into the private env store rather than process.env,
// so pass the URL to Prisma explicitly instead of relying on env("DATABASE_URL").
export const db =
	globalForPrisma.prisma ??
	new PrismaClient({
		datasourceUrl: env.DATABASE_URL,
		log: dev ? ['error', 'warn'] : ['error']
	});

if (dev) globalForPrisma.prisma = db;
