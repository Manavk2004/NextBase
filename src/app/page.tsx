
import prisma from '@/lib/db'
import React from 'react'

const Page = async () => {
  const users = await prisma.user.findMany()
  return (
    <div className='text-red-800 font-extrabold text-5xl'>
      {JSON.stringify(users)}
    </div>
  )
}

export default Page
