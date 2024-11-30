"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"

const Auth = ({ children }) => {
    const { data: session } = useSession()
    const router = useRouter()
  
    useEffect(() => {
      if (session) {
        const role = session?.user?.role
        if (role === 'admin' || role === 'plk' || role === 'gsw') {
          router.push('/admin/layout')
        }
      }
    }, [ session, router])
  
  
    return children
  }
  

const AuthProvider = ({ children }) => {
    return <SessionProvider><Auth>{children}</Auth></SessionProvider>
    
    }

export default AuthProvider;