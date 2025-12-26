"use client";

import Layout from "@/components/Layout";
import { use, useEffect, useState } from "react";
import axios from "axios";
import ProductForm from "@/components/ProductForm";

export default function EditProductPage({ params }) {
  const resolvedParams = use(params);
  const [productInfo, setProductInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = resolvedParams;
  const productId = id?.[0];

  useEffect(() => {
    if (!productId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    axios.get('/api/products?id=' + productId)
      .then(response => {
        setProductInfo(response.data);
      })
      .catch(error => {
        console.error('Failed to load product:', error);
        setError('Product not found or has been deleted.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [productId]);

  return(
    <Layout>
      <h1>Edit Product</h1>

      {isLoading && <p className="text-gray-600">Loading product...</p>}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4 mb-6">
          {error}
        </div>
      )}

      {!isLoading && !error && productInfo && (<ProductForm {...productInfo} />)}
    </Layout>
);
}