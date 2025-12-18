'use client'
import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await axios.post('/api/auth/register', { 
        name, 
        email, 
        password 
      });
      
      console.log("Registration successful:", result.data);

      // After successful registration, automatically sign in the user
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        console.log("Auto sign-in failed:", signInResult.error);
        // Still redirect to login page so user can sign in manually
        router.push("/login");
      } else {
        console.log("Auto sign-in successful");
        router.push("/");
      }
    } catch (error: any) {
      console.log("Registration error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.log("Google sign-up error:", error);
      setError("Google sign-up failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md border-2 border-white rounded-2xl p-8 shadow-lg bg-gray-900">
        <h1 className="text-2xl font-semibold text-center mb-6">Register</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleRegister}>
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              placeholder="Enter Name"
              className="w-full border-b border-white py-2 px-1 bg-gray-900 text-white outline-none placeholder-gray-400"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter Email"
              className="w-full border-b border-white py-2 px-1 bg-gray-900 text-white outline-none placeholder-gray-400"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              className="w-full border-b border-white py-2 px-1 bg-gray-900 text-white outline-none placeholder-gray-400"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          <p className="text-sm text-center mt-1">
            Already have an account?{" "}
            <span 
              className='text-blue-400 hover:underline cursor-pointer' 
              onClick={() => router.push('/login')}
            >
              Login
            </span>
          </p>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="flex items-center gap-[5px] justify-center my-5">
          <hr className="flex-grow border-gray-500" />
          <span>OR</span>
          <hr className="flex-grow border-gray-500" />
        </div>

        <button 
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-400 rounded-lg bg-white text-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle />
          <span>Sign Up With Google</span>
        </button>
      </div>
    </div>
  );
};

export default Register;