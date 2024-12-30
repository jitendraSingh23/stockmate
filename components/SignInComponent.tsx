"use client";

import { signIn } from "next-auth/react";
// import { useSearchParams } from "next/navigation";
import { useState } from "react";

//sign in component
export default function SignIn() {
  // const searchParams = useSearchParams();
  //   const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const callbackUrl = "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    //password length validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setError("Incorrect credentials");
    } else {
      window.location.href = callbackUrl;
    }
  };

  return (
    <div className="min-h-screen w-screen flex justify-center items-center">
      <div className="border border-slate-600 flex flex-col items-center justify-center gap-6 py-8 rounded-2xl px-12">
        <h1 className="text-3xl font-bold ">Welcome to StockMate</h1>
        <h1 className="text-3xl font-bold ">Sign in</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div className="flex flex-col gap-10 w-full  my-10">
          <form onSubmit={handleSignIn} className="flex flex-col ">
            <label className="font-semibold" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  mb-8 "
            />
            <label className="font-semibold" htmlFor="password">
              Password
            </label>

            <input
              type="password"
              placeholder="Password"
              value={password}
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 mb-8"
            />
            <button
              className="w-full text-white bg-black hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center  dark:bg-slate-500 "
              type="submit"
            >
              Sign In
            </button>
          </form>
        </div>
        <a href="/auth/signup">
          Don`t have an account? <span className="text-blue-500">signup</span>
        </a>
      </div>
    </div>
  );
}
