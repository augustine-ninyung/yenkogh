import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { PageFallback } from '@/components/ui/PageFallback';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { ToastContainer } from '@/components/ui/Toast';

// ─── MainLayout ───────────────────────────────────────────────────────────────
// Wraps all public-facing pages with the sticky Navbar, Footer, and Toast portal.

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#090C11] text-[#262B32] dark:text-white">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default MainLayout;
