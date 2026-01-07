
import { WorkflowsContainer, WorkflowsError, WorkflowsList, WorkflowsLoading } from '@/features/workflows/components/workflows'
import { workflowsParamsLoader } from '@/features/workflows/server/params-loader'
import { prefetchWorkFlows } from '@/features/workflows/server/prefetch'
import { requireAuth } from '@/lib/auth.utils'
import { HydrateClient } from '@/trpc/server'
import { SearchParams } from 'nuqs'
import React from 'react'
import { Suspense } from 'react'
import { ErrorBoundary } from "react-error-boundary"


type Props = {
  searchParams: Promise<SearchParams>
}

const Page = async ({ searchParams }: Props) => {
    await requireAuth()


    const params = await workflowsParamsLoader(searchParams)

    prefetchWorkFlows(params);

  return (
    <WorkflowsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<WorkflowsError />}>
          <Suspense fallback={<WorkflowsLoading />}>
            <WorkflowsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowsContainer>
  )
}

export default Page
