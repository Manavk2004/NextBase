import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const useSubscription = () => {
    const trpc = useTRPC();

    return useQuery(trpc.subscriptions.getState.queryOptions())
}

export const useHasActiveSubscription = () => {
    const { data, isLoading, ...rest } = useSubscription()

    return {
        hasActiveSubscription: data?.hasActiveSubscription ?? false,
        subscription: data?.activeSubscriptions?.[0],
        isLoading,
        ...rest
    }
}
