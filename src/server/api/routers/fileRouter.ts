import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { firebaseConfig, storage } from '../../../utils/firebase';
import { FileStatus } from '../../../types/FileStatus';
import { getDownloadURL, ref, uploadString } from '@firebase/storage';
import { arrayBufferToBase64 } from '../../../utils/fileToBase64';

export const fileRouter = createTRPCRouter({
    upload: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string(),
                userId: z.string(),
                size: z.number(),
                file: z.string(),
                status: z.number(),
                createdAt: z.string(),
                updatedAt: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                if (!input) {
                    return;
                }

                const storageRef = ref(
                    storage,
                    `${ctx.session.user.id}/${input.id}.pdf`
                );

                const snapshot = await uploadString(
                    storageRef,
                    input.file,
                    'base64'
                );
                const url = await getDownloadURL(snapshot.ref);

                await ctx.prisma.file.create({
                    data: {
                        id: input.id,
                        name: input.name,
                        userId: input.userId,
                        size: input.size,
                        url,
                        status: input.status,
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
    getFirstNotSorted: protectedProcedure.query(async ({ ctx }) => {
        try {
            const file = await ctx.prisma.file.findFirst({
                where: {
                    AND: [
                        {
                            userId: ctx.session.user.id,
                        },
                        {
                            status: FileStatus.NotSorted,
                        },
                    ],
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            if (!file) {
                return null;
            }

            const response = await fetch(file.url);
            const bytes = await response.arrayBuffer();
            const base64 = arrayBufferToBase64(bytes);

            return {
                ...file,
                file: base64,
            };
        } catch (error) {
            console.error('error', error);
        }
    }),
    getAccepted: protectedProcedure.query(async ({ ctx }) => {
        try {
            return await ctx.prisma.file.findMany({
                where: {
                    AND: [
                        {
                            userId: ctx.session.user.id,
                        },
                        {
                            status: FileStatus.Accepted,
                        },
                    ],
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        } catch (error) {
            console.error('error', error);
        }
    }),
    rejectDocument: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            try {
                if (!input) {
                    return;
                }

                await ctx.prisma.file.update({
                    where: {
                        id: input.id,
                    },
                    data: {
                        status: FileStatus.Rejected,
                    },
                });
            } catch (error) {
                console.error('error', error);
            }
        }),
    acceptDocument: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            try {
                if (!input) {
                    return;
                }

                await ctx.prisma.file.update({
                    where: {
                        id: input.id,
                    },
                    data: {
                        status: FileStatus.Accepted,
                    },
                });
            } catch (error) {
                console.error('error', error);
            }
        }),
    getFirebaseConfig: publicProcedure.query(() => {
        try {
            return firebaseConfig;
        } catch (error) {
            console.error('error', error);
        }
    }),
});
