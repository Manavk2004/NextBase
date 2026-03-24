import { getCustomerState } from "@/lib/polar-helpers";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const subscriptionsRouter = createTRPCRouter({
  getState: protectedProcedure.query(async ({ ctx }) => {
    const customer = await getCustomerState(ctx.auth.user.id, ctx.auth.user.email);

    return {
      activeSubscriptions: customer?.activeSubscriptions ?? [],
      hasActiveSubscription:
        (customer?.activeSubscriptions?.length ?? 0) > 0,
    };
  }),
});
