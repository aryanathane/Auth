'use client'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import React, { useContext, useEffect, useState } from 'react'

type userContextType = {
  user: userType | null | undefined,
  setUser: (user: userType | null) => void
}

type userType = {
  name: string,
  email: string,
  id: string,
  image?: string 
}

export const userDataContext = React.createContext<userContextType | undefined>(undefined)

function UserContext({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<userType | null>(null)
  const { data: session, status } = useSession()

  useEffect(() => {
    async function getUser() {
      // Only fetch if user is authenticated
      if (status === 'authenticated') {
        try {
          const result = await axios.get("/api/user")
          setUser(result.data)
        } catch (error) {
          console.error('Error fetching user:', error)
          setUser(null)
        }
      } else if (status === 'unauthenticated') {
        setUser(null)
      }
    }
    getUser()
  }, [status]) // Depend on status instead of entire session object

  return (
    <userDataContext.Provider value={{ user, setUser }}>
      {children}
    </userDataContext.Provider>
  )
}

// Custom hook for using the context
export const useUserContext = () => {
  const context = useContext(userDataContext)
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserContext provider')
  }
  return context
}

export default UserContext