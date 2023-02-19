import { createTRPCRouter } from './trpc';
import { exampleRouter } from './routers/example';
import { fileRouter } from './routers/fileRouter';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
    example: exampleRouter,
    file: fileRouter,
});

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '50mb',
        },
    },
};

// export type definition of API
export type AppRouter = typeof appRouter;
