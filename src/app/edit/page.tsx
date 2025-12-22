"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CgProfile } from "react-icons/cg";
import axios from "axios";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";

function Page() {
  const { user, setUser } = useUserContext();
  const router = useRouter();
  const [name, setName] = useState("");
  const [frontendImage, setFrontendImage] = useState("");
  const [backendImage, setBackendImage] = useState<File>();
  const imageInput = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file");
      return;
    }
    
    setError("");
    setSuccess("");
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (backendImage) {
        formData.append("file", backendImage);
      }
      
      const result = await axios.post("/api/edit", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUser(result.data);
      setSuccess("Profile updated successfully!");
      setBackendImage(undefined); // Clear the file input
      setLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setFrontendImage(user.image || "");
    }
  }, [user]);

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (frontendImage && frontendImage.startsWith('blob:')) {
        URL.revokeObjectURL(frontendImage);
      }
    };
  }, [frontendImage]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md border-2 border-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Edit Profile
        </h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-200 text-sm">
            {success}
          </div>
        )}
        
        <form
          className="space-y-6 flex flex-col w-full items-center"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-[120px] h-[120px] rounded-full border-2 flex justify-center items-center border-white transition-all hover:border-blue-500 text-white hover:text-blue-500 cursor-pointer overflow-hidden relative group"
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
                <>
                  <Image 
                    src={frontendImage} 
                    fill 
                    alt="Profile preview" 
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-sm">Change Photo</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <CgProfile size={40} />
                  <span className="text-xs">Add Photo</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">Click to upload image (max 5MB)</p>
          </div>
          
          <div className="w-full">
            <label className="block mb-2 font-medium">Name</label>
            <input
              type="text"
              placeholder="Enter Name"
              className="w-full border-b border-white py-2 px-1 bg-black text-white outline-none placeholder-gray-400 focus:border-blue-500 transition-colors"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>
          
          <div className="w-full">
            <label className="block mb-2 font-medium">Email</label>
            <input
              type="email"
              className="w-full border-b border-gray-600 py-2 px-1 bg-black text-gray-500 outline-none cursor-not-allowed"
              value={user.email}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          
          <div className="flex gap-3 w-full">
            <button
              type="button"
              className="flex-1 py-2 px-4 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-colors"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Page;