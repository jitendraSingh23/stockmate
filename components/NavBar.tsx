"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function NavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const initials = session?.user.name?.charAt(0);

  if (status === "loading") {
    return (
      <div className="flex justify-between bg-gray-100 p-5 animate-pulse">
        <div className="bg-gray-200 rounded w-24 h-10"></div>
        <div className="flex items-center gap-5">
          <div className="flex gap-3">
            <ul>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </ul>
            <ul>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </ul>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden md:flex h-6 bg-gray-200 rounded w-20"></div>
            <div className="px-2 py-1 bg-gray-200 rounded text-sm md:text-lg w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <div>you are not logged in</div>;
  }

  return (
    <div className="flex  justify-between bg-slate-100 dark:bg-slate-950 p-5">
      <a
        href="/dashboard"
        className="flex justify-center items-center font-semibold italic text-sm md:text-lg"
      >
        StockMate
      </a>
      <div className="flex items-center gap-5 md:gap-10">
        <div className="flex gap-3 text-sm capitalize md:text-lg md:gap-10  ">
          <ul>
            <Link
              href="/dashboard"
              className={`hover:text-blue-600 transition-colors ${
                pathname === "/dashboard"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : ""
              }`}
            >
              dashboard
            </Link>
          </ul>
          <ul>
            <Link
              href="/inventory"
              className={`hover:text-blue-600 transition-colors ${
                pathname === "/inventory"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : ""
              }`}
            >
              inventory
            </Link>
          </ul>
        </div>
        <Link
          href="/me"
          className={`flex items-center capitalize justify-center w-10 h-10 text-2xl bg-slate-300  dark:bg-slate-600  rounded-full gap-5 hover:border-2 hover:border-blue-600 transition-transform duration-1000 ${
            pathname === "/me"
              ? "border-2 border-blue-600"
              : ""
          }`}
        >
          {initials}
        </Link>
      </div>
    </div>
  );
}
