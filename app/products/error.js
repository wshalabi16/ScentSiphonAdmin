'use client';

import { useEffect } from 'react';
import Layout from '@/components/Layout';

export default function ProductsError({ error, reset }) {
  useEffect(() => {
    console.error('Products page error:', error);
  }, [error]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-900 mb-2">
            Products Error
          </h2>
          <p className="text-red-700 mb-4">
            An error occurred while loading the products page. Please try again.
          </p>
          <button
            onClick={() => reset()}
            className="btn-primary"
          >
            Try again
          </button>
        </div>
      </div>
    </Layout>
  );
}
