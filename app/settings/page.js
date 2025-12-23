"use client";

import Layout from "@/components/Layout";
import { useEffect } from "react";

export default function Settings() {
  useEffect(() => {
    document.title = 'Settings | Scent Siphon Admin';
  }, []);

  return (
    <Layout>
      <h1>Settings</h1>
    </Layout>
  );
}