"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.log("Login failed:", result.error);
        setError(result.error);
      } else {
        console.log("Login successful");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.log("Google sign-in error:", error);
      setError("Google sign-in failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md border-2 border-white rounded-2xl p-8 shadow-lg bg-gray-900">
        <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSignIn}>
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
              disabled={loading}
            />
          </div>
          <p className="text-sm text-center mt-1">
            Create Account?{" "}
            <span
              className="text-blue-400 hover:underline cursor-pointer"
              onClick={() => router.push("/register")}
            >
              Register
            </span>
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex items-center gap-[5px] justify-center my-5">
          <hr className="flex-grow border-gray-500" />
          <span>OR</span>
          <hr className="flex-grow border-gray-500" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-400 rounded-lg bg-white text-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle />
          <span>Sign in With Google</span>
        </button>
      </div>
    </div>
  );
};

export default Login;