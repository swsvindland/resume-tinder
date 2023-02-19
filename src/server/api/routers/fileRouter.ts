import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { FileStatus } from '../../../types/FileStatus';
import { supabase } from '../../../utils/supabase';
import { env } from '../../../env.mjs';
import { decode } from 'base64-arraybuffer';

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

                console.log('input', input);

                const { data, error } = await supabase.storage
                    .from('resumes')
                    .upload(
                        `${ctx.session.user.id}/${input.id}.pdf`,
                        decode(input.file),
                        {
                            contentType: 'application/pdf',
                        }
                    );

                console.log('upload', data, error);

                await ctx.prisma.file.create({
                    data: {
                        id: input.id,
                        name: input.name,
                        userId: input.userId,
                        size: input.size,
                        url: data?.path ?? '',
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

            return {
                ...file,
                url: `${env.SUPABASE_URL}/storage/v1/object/public/resumes/${file.url}`,
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
});
