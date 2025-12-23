import React from 'react'
import { LoginForm } from './components/login-form'
import { requireAuth, requireUnAuth } from '@/lib/auth.utils'

const Page = async () => {
  await requireUnAuth()
  
  return (
    <div>
      <LoginForm />
    </div>
  )
}

export default Page
