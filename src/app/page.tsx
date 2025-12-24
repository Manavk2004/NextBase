
"use client"
import { Button } from '@/components/ui/button';

import { requireAuth } from '@/lib/auth.utils';
import { caller } from '@/trpc/server';
import { LogoutButton } from './logout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { toast } from 'sonner';

const Page =  () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { data } = useQuery(trpc.getWorkflows.queryOptions())

  const create = useMutation(trpc.createWorkFlow.mutationOptions({
    onSuccess: () => {
      toast.success("Job queued")
    },
    onError: () => {
      toast.error("Failed")
    }
  }))

  const testAi = useMutation(trpc.testAi.mutationOptions({
    onSuccess: () => {
      toast.success("SUccess")
    }
  }))

  return (
    <div className='flex flex-col gap-5 justify-center items-center min-h-screen'>
      <div className='min-w-screen flex items-center justify-center'>
        {JSON.stringify(data, null, 2)}
      </div>
      <Button disabled={testAi.isPending} onClick={() => testAi.mutate()}>
        Test AI
      </Button>
      <Button disabled={create.isPending} onClick={() => create.mutate()}>
        Create workflow
      </Button>
    </div>
  )
}

export default Page
