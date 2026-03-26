import { requireAuth } from "@/lib/auth.utils";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ExecutionDetail, ExecutionDetailError, ExecutionDetailLoading } from "@/features/executions/components/execution-detail";

interface PageProps {
  params: Promise<{
    executionId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { executionId } = await params;
  await requireAuth();

  await prefetch(trpc.executions.getOne.queryOptions({ id: executionId }));

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<ExecutionDetailError />}>
        <Suspense fallback={<ExecutionDetailLoading />}>
          <ExecutionDetail executionId={executionId} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
