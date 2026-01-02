import { WorkflowsContainer, WorkflowsList } from '@/features/workflows/components/workflows'
import { prefetchWorkFlows } from '@/features/workflows/server/prefetch'
import { requireAuth } from '@/lib/auth.utils'
import { HydrateClient } from '@/trpc/server'
import React from 'react'
import { Suspense } from 'react'
import { ErrorBoundary } from "react-error-boundary"

const Page = async () => {
    await requireAuth()

    prefetchWorkFlows();

  return (
    <WorkflowsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<p>Error!</p>}>
          <Suspense fallback={<p>Loading...</p>}>
            <WorkflowsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowsContainer>
  )
}

export default Page
