
import { createTRPCRouter } from '../init';
import { subscriptionsRouter } from '@/features/subscriptions/server/routers';
import { workflowsRouter } from '@/features/workflows/server/routers';



export const appRouter = createTRPCRouter({
  subscriptions: subscriptionsRouter,
  workflows: workflowsRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;