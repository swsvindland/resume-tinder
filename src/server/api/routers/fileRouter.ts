import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ref } from '@firebase/storage';
import { app, firebaseConfig, storage } from '../../../utils/firebase';

export const fileRouter = createTRPCRouter({
    upload: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string(),
                userId: z.string(),
                size: z.number(),
                url: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                if (!input) {
                    return;
                }

                await ctx.prisma.file.create({
                    data: {
                        id: input.id,
                        name: input.name,
                        userId: input.userId,
                        size: input.size,
                        url: input.url,
                        createdAt: input.createdAt,
                        updatedAt: input.updatedAt,
                    },
                });
            } catch (error) {
                console.log(error);
            }
        }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
        try {
            return await ctx.prisma.file.findMany({
                where: {
                    userId: ctx.session?.user.id,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        } catch (error) {
            console.log('error', error);
        }
    }),
    getFirebaseConfig: protectedProcedure.query(() => {
        try {
            return firebaseConfig;
        } catch (error) {
            console.error('error', error);
        }
    }),
});
