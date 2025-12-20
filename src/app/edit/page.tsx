"use client";
import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CgProfile } from "react-icons/cg";

const Page = () => {
  const { data } = useSession();
  const [name, setName] = useState("");
  const [frontendImage, setFrontendImage] = useState("");
  const [backendImage, setBackendImage] = useState<File>();
  const imageInput = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setBackendImage(file);
    
    // Revoke old object URL to prevent memory leak
    if (frontendImage && frontendImage.startsWith('blob:')) {
      URL.revokeObjectURL(frontendImage);
    }
    
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Add your form submission logic here
    console.log("Name:", name);
    console.log("Image file:", backendImage);
    
    // Example: Upload to server
    // const formData = new FormData();
    // formData.append('name', name);
    // if (backendImage) formData.append('image', backendImage);
    // await fetch('/api/update-profile', { method: 'POST', body: formData });
  };

  useEffect(() => {
    if (data?.user?.name) {
      setName(data.user.name as string);
      setFrontendImage(data?.user.image as string);
    }
  }, [data]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (frontendImage && frontendImage.startsWith('blob:')) {
        URL.revokeObjectURL(frontendImage);
      }
    };
  }, [frontendImage]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md border-2 border-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-center mb-2">
          Edit Profile
        </h1>
        <form className="space-y-4 flex flex-col w-full items-center" onSubmit={handleSubmit}>
          <div 
            className="w-[100px] h-[100px] rounded-full border-2 flex justify-center items-center border-white transition-all hover:border-blue-500 text-white hover:text-blue-500 cursor-pointer overflow-hidden relative" 
            onClick={() => imageInput.current?.click()}
          >
            <input 
              type="file" 
              accept="image/*" 
              hidden 
              ref={imageInput} 
              onChange={handleImage}
            />
            {frontendImage ? (
              <Image
                src={frontendImage}
                fill
                alt="profile image"
                className="object-cover"
              />
            ) : (
              <CgProfile size={60} />
            )}
          </div>
          <div className="w-full">
            <label className="block mb-2 font-medium text-sm">Name</label>
            <input
              type="text"
              placeholder="Enter Name"
              className="w-full border border-white/30 rounded-lg py-3 px-4 bg-white/5 backdrop-blur-sm text-white outline-none placeholder-gray-500 focus:border-blue-500 focus:bg-white/10 transition-all"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full py-2 px-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;