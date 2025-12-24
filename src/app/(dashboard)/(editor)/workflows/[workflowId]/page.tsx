import { requireAuth } from '@/lib/auth.utils'
import React from 'react'

interface PageProps {
    params: Promise<{
        workflowId: string
    }>
};



const Page = async ({ params } : PageProps ) => {
    const { workflowId } = await params

    await requireAuth()
    


  return (
    <div>
    Workflow id: { workflowId }
    </div>
  )
}

export default Page
