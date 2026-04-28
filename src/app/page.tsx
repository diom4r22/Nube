"use client";

import { Header } from "@/components/layout/header";
import { FullscreenScene } from "@/components/scene/FullscreenScene";

export default function Home() {
  return (
    <>
      <div className="fixed top-0 w-full z-[100] pointer-events-auto">
        <Header />
      </div>
      
      <main className="relative w-full h-screen overflow-hidden">
        <FullscreenScene />
      </main>
    </>
  );
}
