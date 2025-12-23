
import { Button } from '@/components/ui/button';
import { requireAuth } from '@/lib/auth.utils';
import { caller } from '@/trpc/server';
import { LogoutButton } from './logout';

const Page =  async () => {

  await requireAuth()


  const data = await caller.getUsers()

  return (
    <div className='flex flex-col justify-center items-center min-h-screen'>
      <div className='min-w-screen flex items-center justify-center'>
        {JSON.stringify(data, null, 2)}
      </div>
      <LogoutButton />
    </div>
  )
}

export default Page
