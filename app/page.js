"use client";

import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  
  return (
    <Layout>
      <div className="flex justify-between items-center w-full">
        <h2 className="text-gray-900 text-xl font-semibold">
          Welcome, <b>{session?.user?.name}</b>
        </h2>
        <div className="flex bg-gray-100 gap-2 text-gray-900 rounded-lg overflow-hidden border border-gray-200 px-3 py-2">
          <img src={session?.user?.image} alt="" className="w-6 h-6 rounded-full"/>
          <span className="font-medium">
            {session?.user?.name}
          </span>
        </div>
      </div>
    </Layout>
  );
}