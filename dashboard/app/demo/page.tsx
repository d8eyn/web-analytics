'use client';

import FunnelAnalysisDemo from '../../components/FunnelAnalysisDemo';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Meta from '../../components/Meta';

export default function DemoPage() {
  return (
    <>
      <Meta />
      <div className="min-h-screen px-5 py-5 text-sm leading-5 bg-body sm:px-10 text-secondary">
        <div className="mx-auto max-w-7xl">
          <Header />
          <div className="mb-6">
            <a 
              href="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Main Dashboard
            </a>
          </div>
          <FunnelAnalysisDemo />
          <Footer />
        </div>
      </div>
    </>
  );
} 