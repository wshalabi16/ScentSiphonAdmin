"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Nav from "@/components/Nav";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

export default function Layout({ children }) {
  const [showNav, setShowNav] = useState(false);
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="bg-gray-100 w-screen h-screen flex items-center">
        <div className="text-center w-full">
          <button onClick={() => signIn("google")} className="bg-white p-4 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium text-gray-900 border border-gray-200 hover:border-blue-500">Login with Google</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="md:hidden flex items-center p-4 bg-white shadow-sm border-b border-gray-200">
        <button onClick={() => setShowNav(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-gray-700">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="flex grow justify-center mr-6">
          <Logo />
        </div>
      </div>
      <div className="flex">
        <Nav show={showNav}/>
        <div className="grow mt-2 mr-2 mb-2 ml-2 md:ml-0 rounded-lg p-6 bg-white shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
