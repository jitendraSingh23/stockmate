"use client";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import { useSession, signOut } from "next-auth/react";
import githubicon from "../../img/github-brands-solid.svg";
import Link from "next/link";

export default function ME() {
  const { data: session } = useSession();
  const initials = session?.user.name?.charAt(0);
  const userName = session?.user.name?.toString();
  const userEmail = session?.user.email?.toString();
  return (
    <div className="flex flex-col">
      <NavBar />
      <div className=" flex justify-center items-center w-screen   ">
        <div>
          <div className="flex flex-col justify-center items-center w-96  border  rounded-xl mt-10">
            <div className=" flex  justify-center items-center text-6xl text-center rounded-full h-20 w-20 m-10 bg-slate-200  dark:bg-slate-600  capitalize font-semibold">
              {initials}
            </div>
            <div className="flex flex-col gap-5 justify-center items-center m-10">
              <div className=" flex  justify-center items-center gap-3">
                <label htmlFor="username" className="text-xl font-semibold">
                  Name:
                </label>
                <input
                  type="text"
                  name="username"
                  disabled
                  placeholder={userName}
                  defaultValue={userName}
                  className="border-2 border-slate-300  h-10 text-black dark:text-white px-2 rounded-md"
                />
              </div>

              <div className=" flex justify-center items-center gap-3 ">
                <label htmlFor="Email" className="text-xl font-semibold">
                  Email:
                </label>
                <input
                  type="text"
                  name="Email"
                  disabled
                  placeholder={userEmail}
                  defaultValue={userEmail}
                  className="border-2 border-slat-300 h-10 text-black dark:text-white px-2 rounded-md"
                />
              </div>
              <div className=" flex justify-center items-center w-full my-5 ">
                <button
                  onClick={() => signOut()}
                  className="bg-red-500 hover:bg-red-700 hover:scale-95 transition-transform duration-300 w-full h-full py-2 rounded-md text-white text-lg "
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center my-10">
            <Link
              href="https://github.com/jitendraSingh23"
              target="_blank"
              className="text-black border-2 border-black bg-[#ffffff] hover:bg-slate-600 hover:text-white focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2 mb-2"
            >
              <Image src={githubicon} alt="git" className="h-5 w-5 mr-2" />
              More Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
