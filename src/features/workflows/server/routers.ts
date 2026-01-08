import { Input } from "@/components/ui/input";
import { PAGINATION } from "@/config/constants";
import prisma from "@/lib/db";
import { createTRPCRouter, premiumProcedure, protectedProcedure } from "@/trpc/init";
import { generateSlug } from "random-word-slugs"
import z from "zod";

//TRPC router is esentially like the toolbox and the procedures are the individual tools you can use


//We have premiumProcedure and protectedProcedure which are two pieces of middleware that we have defined inside TRPC. 
//TRPC gives us the ability to define middleware for a secure way to proceed with all the big actions like the following.
//These middleware pieces out of the box come with query and mutation functions that we can use to run the middleware first, and then run the function that we want. Its a very smooth way of applying the middleware to big functions.
//Middleware is like customs when traveling between countries. It serves as the intermediary 


export const workflowsRouter = createTRPCRouter({
    create: premiumProcedure.mutation(({ ctx }) => {
        return prisma.workflow.create({
            data: {
                name: generateSlug(3),
                userId: ctx.auth.user.id
            }
        })
    }),
    remove: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
        return prisma.workflow.delete({
            where: {
                id: input.id,
                userId: ctx.auth.user.id,
            }
        })
    }),
    updateName: protectedProcedure.input(z.object({ id: z.string(), name: z.string().min(1)})).mutation(({ ctx, input }) => {
        return prisma.workflow.update({
            where: { id: input.id, userId: ctx.auth.user.id },
            data: { name: input.name }
        })
    }),
    getOne: protectedProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
        return prisma.workflow.findUniqueOrThrow({
            where: { id: input.id, userId: ctx.auth.user.id }
        })
    }),
    getMany: protectedProcedure
        .input(z.object({ page: z.number().default(PAGINATION.DEFAULT_PAGE), pageSize: z.number().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE), search: z.string().default("")}))
        .query(async ({ ctx, input }) => {
            const { page, pageSize, search } = input;
            const [items, totalCount] = await Promise.all([
                prisma.workflow.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: { 
                        userId: ctx.auth.user.id,
                        name: {
                            contains: search,
                            mode: "insensitive"
                        } 
                    },
                    orderBy: {
                        updatedAt: "desc"
                    }
                }),
                prisma.workflow.count({
                    where: {
                        userId: ctx.auth.user.id,
                        name: {
                            contains: search,
                            mode: "insensitive"
                        }
                    }
                })
            ])
            const totalPages = Math.ceil(totalCount / pageSize);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            return {
                items: items,
                page,
                pageSize,
                totalCount,
                totalPages,
                hasNextPage,
                hasPreviousPage,
            };
        }),
})