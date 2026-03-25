import { PAGINATION } from "@/config/constants";
import { CredentialType } from "@/generated/prisma/enums";
import prisma from "@/lib/db";
import { encrypt, decrypt, maskApiKey } from "@/lib/encryption";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

const credentialTypeEnum = z.nativeEnum(CredentialType);

export const credentialsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(100),
        type: credentialTypeEnum,
        apiKey: z.string().min(1, "API key is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const encryptedApiKey = encrypt(input.apiKey);
      return prisma.credential.create({
        data: {
          name: input.name,
          type: input.type,
          encryptedApiKey,
          userId: ctx.auth.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        apiKey: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data: Record<string, unknown> = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.apiKey !== undefined) data.encryptedApiKey = encrypt(input.apiKey);

      return prisma.credential.update({
        where: { id: input.id, userId: ctx.auth.user.id },
        data,
      });
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return prisma.credential.delete({
        where: { id: input.id, userId: ctx.auth.user.id },
      });
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const credential = await prisma.credential.findUniqueOrThrow({
        where: { id: input.id, userId: ctx.auth.user.id },
      });
      const decryptedKey = decrypt(credential.encryptedApiKey);
      return {
        id: credential.id,
        name: credential.name,
        type: credential.type,
        maskedApiKey: maskApiKey(decryptedKey),
        createdAt: credential.createdAt,
        updatedAt: credential.updatedAt,
      };
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;
      const where = {
        userId: ctx.auth.user.id,
        name: { contains: search, mode: "insensitive" as const },
      };

      const [items, totalCount] = await Promise.all([
        prisma.credential.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where,
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            name: true,
            type: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.credential.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    }),

  getByType: protectedProcedure
    .input(z.object({ type: credentialTypeEnum }))
    .query(({ ctx, input }) => {
      return prisma.credential.findMany({
        where: { userId: ctx.auth.user.id, type: input.type },
        select: { id: true, name: true, type: true },
        orderBy: { name: "asc" },
      });
    }),
});
