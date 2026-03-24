import { auth } from '@/lib/auth';
import { getCustomerState } from '@/lib/polar-helpers';
import { initTRPC, TRPCError } from '@trpc/server';
import { headers } from 'next/headers';
import { cache } from 'react';
import superjson from "superjson"


//This createTRPCContext is an optional section where we can have stuff inside the ctx in the procedures below. 
//When we do 'const t = initTRPC.create()', we instead have to do 'const t = initTRPC.context().create()' to actually give it the context.
//Here we did not attach it because we do not need it atm

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: 'user_123',};
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ ctx, next}) => {


  const session = await auth.api.getSession({
    headers: await headers()
  })

  if(!session){
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized"
    })
  }
  

  return next({ ctx: {...ctx, auth: session }})
})

export const premiumProcedure = protectedProcedure.use(
  async({ ctx, next }) => {
    const customer = await getCustomerState(ctx.auth.user.id, ctx.auth.user.email);

    if (
      !customer?.activeSubscriptions || customer.activeSubscriptions.length === 0
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Active subscription required"
      })
    }

    return next({ ctx: {...ctx, customer }})
  }
)