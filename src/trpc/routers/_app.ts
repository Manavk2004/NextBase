
import { createTRPCRouter } from '../init';
import { subscriptionsRouter } from '@/features/subscriptions/server/routers';
import { workflowsRouter } from '@/features/workflows/server/routers';
import { credentialsRouter } from '@/features/credentials/server/routers';
import { executionsRouter } from '@/features/executions/server/routers';



export const appRouter = createTRPCRouter({
  subscriptions: subscriptionsRouter,
  workflows: workflowsRouter,
  credentials: credentialsRouter,
  executions: executionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;