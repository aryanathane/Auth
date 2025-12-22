'use client'
import { signOut } from 'next-auth/react'
import React, { useState } from 'react'
import Image from 'next/image'
import { HiPencil } from "react-icons/hi2"
import { useRouter } from 'next/navigation'
import { useUserContext } from '@/context/UserContext'

function Page() {
  const { user, setUser } = useUserContext() // Use the hook instead
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut({ callbackUrl: '/' })
      setUser(null) // Clear user from context
    } catch (error) {
      console.error('Sign out error:', error)
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-black text-white px-4'>
      {user ? (
        <div className='w-full max-w-md border-2 border-white rounded-2xl p-8 shadow-lg text-center relative flex flex-col items-center'>
          <HiPencil 
            size={22} 
            color='white' 
            className='absolute right-[20px] top-[20px] cursor-pointer hover:scale-110 transition-transform' 
            onClick={() => router.push("/edit")}
            aria-label="Edit profile"
          />
          
          {user.image ? (
            <div className='relative w-[200px] h-[200px] rounded-full border-2 border-white overflow-hidden'>
              <Image 
                src={user.image} 
                fill 
                alt={`${user.name}'s profile picture`}
                className='object-cover'
                priority
              />
            </div>
          ) : (
            <div className='w-[200px] h-[200px] rounded-full border-2 border-white bg-gray-700 flex items-center justify-center text-4xl font-bold'>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          
          <h1 className='text-2xl font-semibold my-4'>
            Welcome, {user.name}
          </h1>
          
          {user.email && (
            <p className='text-gray-400 mb-4'>{user.email}</p>
          )}
          
          <button 
            className='w-full py-2 px-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed' 
            onClick={handleSignOut}
            disabled={loading}
          >
            {loading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      ) : (
        <div className='text-white text-2xl'>Loading...</div>
      )}
    </div>
  )
}

export default Page