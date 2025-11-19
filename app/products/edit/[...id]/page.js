"use client";

import Layout from "@/components/Layout";
import { use, useEffect, useState } from "react";
import axios from "axios";
import ProductForm from "@/components/ProductForm";

export default function EditProductPage({ params }) {
  const resolvedParams = use(params);  
  const [productInfo, setProductInfo] = useState(null);
  const { id } = resolvedParams; 
  const productId = id?.[0]; 

  useEffect(() => {
    if (!productId) {
      return;
    }
    axios.get('/api/products?id=' + productId).then(response => {
      setProductInfo(response.data);
    });
  }, [productId]);

    return(
        <Layout>
            <h1>Edit Product</h1>
            {productInfo && (() => <ProductForm {...productInfo} />)()}
        </Layout>
    );
}