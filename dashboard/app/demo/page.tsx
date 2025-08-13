'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Footer from '../../components/Footer';
import Meta from '../../components/Meta';

// Dynamically import components that use useSearchParams with no SSR
const Header = dynamic(
  () => import('../../components/Header'),
  { 
    ssr: false,
    loading: () => <div className="h-20" />
  }
);

const FunnelAnalysisDemo = dynamic(
  () => import('../../components/FunnelAnalysisDemo'),
  { 
    ssr: false,
    loading: () => <div className="text-center py-10">Loading demo...</div>
  }
);

export default function DemoPage() {
  return (
    <>
      <Meta />
      <div className="min-h-screen px-5 py-5 text-sm leading-5 bg-body sm:px-10 text-secondary">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={<div className="h-20" />}>
            <Header />
          </Suspense>
          <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
            <FunnelAnalysisDemo />
          </Suspense>
          <Footer />
        </div>
      </div>
    </>
  );
} 