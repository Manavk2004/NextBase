import { useTRPC } from "@/trpc/client";
import { getReadableErrorMessage } from "@/lib/error-utils";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useExecutionsParams } from "./use-executions-params";

export const useSuspenseExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();

  return useSuspenseQuery(trpc.executions.getMany.queryOptions(params));
};

export const useRemoveExecution = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.executions.remove.mutationOptions({
      onSuccess: () => {
        toast.success("Execution removed");
        queryClient.invalidateQueries(
          trpc.executions.getMany.queryOptions({})
        );
      },
      onError: (error) => {
        toast.error(
          getReadableErrorMessage(error, "Failed to remove execution.")
        );
      },
    })
  );
};
