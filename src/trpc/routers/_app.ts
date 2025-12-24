import { inngest } from '@/inngest/client';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import prisma from '@/lib/db';
export const appRouter = createTRPCRouter({
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