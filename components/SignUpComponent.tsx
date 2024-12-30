
"use client";
import { useState } from "react";
//import { useSearchParams } from 'next/navigation';
import { signIn } from "next-auth/react";
//signup component
export default function SignUp() {
   //const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
//   const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const callbackUrl = '/dashboard';

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
//password length validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    try {
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        throw new Error(signupData.error || "Signup failed");
      }

      const signinRes = await signIn("credentials", {
        redirect: false,
        email,
        password
      });

      if (signinRes?.error) {
        throw new Error(signinRes.error);
      }

      window.location.href = callbackUrl;
    } catch (err) {
      setError((err as Error).message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex justify-center items-center">
      <div className="border border-slate-600 flex flex-col items-center justify-center gap-6 py-8 rounded-2xl px-12 ">
        <h1 className="text-3xl font-bold">Welcome to StockMate</h1>
        <h1 className="text-3xl font-bold">Sign up</h1>
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex flex-col gap-10 w-full ">
          <form onSubmit={handleSignUp} method="POST" className="flex flex-col">
            <label className="font-semibold" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 mb-8"
            />
            <label className="font-semibold" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 mb-8"
            />
            <label className="font-semibold" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              minLength={8}
              onChange={e => setPassword(e.target.value)}
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 mb-8"
            />
            <button
              className="w-full text-white bg-black hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-slate-500 "
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
        </div>
        <a href="/auth/signin">
          Already have an account?{" "}
          <span className="text-blue-500">Sign in</span>
        </a>
      </div>
    </div>
  );
}
