import { useTRPC } from "@/trpc/client";
import { getReadableErrorMessage } from "@/lib/error-utils";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCredentialsParams } from "./use-credentials-params";

export const useSuspenseCredentials = () => {
  const trpc = useTRPC();
  const [params] = useCredentialsParams();

  return useSuspenseQuery(trpc.credentials.getMany.queryOptions(params));
};

export const useCreateCredential = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.credentials.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential "${data.name}" created`);
        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions({})
        );
      },
      onError: (error) => {
        toast.error(
          getReadableErrorMessage(error, "Failed to create credential.")
        );
      },
    })
  );
};

export const useUpdateCredential = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.credentials.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential "${data.name}" updated`);
        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions({})
        );
        queryClient.invalidateQueries(
          trpc.credentials.getOne.queryOptions({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(
          getReadableErrorMessage(error, "Failed to update credential.")
        );
      },
    })
  );
};

export const useRemoveCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential "${data.name}" removed`);
        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions({})
        );
      },
      onError: (error) => {
        toast.error(
          getReadableErrorMessage(error, "Failed to remove credential.")
        );
      },
    })
  );
};
