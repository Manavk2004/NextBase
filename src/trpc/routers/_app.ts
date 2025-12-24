import { inngest } from '@/inngest/client';
import { createTRPCRouter, protectedProcedure } from '../init';
import prisma from '@/lib/db';
import { TRPCError } from '@trpc/server';



export const appRouter = createTRPCRouter({
  testAi: protectedProcedure.mutation(async () => {
    
    throw new TRPCError({ code: "BAD_REQUEST", message: "Something went wrong"})

    await inngest.send({
      name: "execute/ai"
    })
  }),
  getWorkflows: protectedProcedure.query(({ ctx }) => {
        return prisma.workflow.findMany()
  }),
  createWorkFlow: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "test/hello.world",
      data: {
        email: "mjkamdar04@gmail.com",
      }
    })
    return { success: true, message: "Job queued"}
  })
});
// export type definition of API
export type AppRouter = typeof appRouter;