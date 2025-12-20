"use client"
import { useSession, signOut } from 'next-auth/react'
import React, { useState } from 'react'
import Image from 'next/image'
import { HiPencil } from "react-icons/hi2";

function ProfilePage() {
  const { data, status } = useSession();
  const[loading,setLoading]=useState(false);

  console.log(data);
  
  // Handle sign out
  const handleSignOut = async() => {
    setLoading(false);
   try {
      await signOut(); 
   } catch (error) {
    setLoading(true);
   }
  };
  
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-black text-white px-4'>
      
      {/* Loading state */}
      {status === 'loading' && (
        <div className='text-white text-2xl'>Loading...</div>
      )}
      
      {/* Authenticated state */}
      {status === 'authenticated' && data && (
        <div className='w-full max-w-md border-2 border-white rounded-2xl p-8 shadow-lg text-center relative flex flex-col items-center'>
          
          {/* Edit button */}
          <HiPencil 
            size={22} 
            color='white' 
            className='absolute right-[20px] top-[20px] cursor-pointer hover:scale-110 transition-transform'
            onClick={() => console.log('Edit profile clicked')}
            aria-label="Edit profile"
          /> 
          
          {/* Profile image */}
          {data.user?.image && data.user.image.trim() !== '' ? (
            <div className='relative w-[200px] h-[200px] rounded-full border-2 border-white overflow-hidden'>
              <Image 
                src={data.user.image} 
                fill 
                alt={`${data.user.name}'s profile picture`}
                className='object-cover'
              />
            </div>
          ) : (
            <div className='w-[200px] h-[200px] rounded-full border-2 border-white bg-gray-700 flex items-center justify-center text-4xl font-bold'>
              {data.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          
          {/* Welcome message */}
          <h1 className='text-2xl font-semibold my-4'>
            Welcome, {data.user?.name}
          </h1>
      
          
          {/* Sign out button */}
          <button 
            onClick={handleSignOut}
            className='w-full py-2 px-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors'
          >
            Sign Out
          </button>
        </div>
      )}
      
      {/* Unauthenticated state */}
      {status === 'unauthenticated' && (
        <div className='text-white text-2xl'>
          Please sign in to view your profile
        </div>
      )}
      
    </div>
  )
}

export default ProfilePage