"use client";

import Layout from "@/components/Layout";
import { useRouter } from "next/navigation";  
import { use, useEffect, useState } from "react";
import axios from "axios";

export default function DeleteProduct({ params }) {  
    const resolvedParams = use(params);  
    const router = useRouter();
    const [productInfo, setProductInfo] = useState();
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

    function goBack() {
        router.push('/products');
    }

    async function deleteProduct() {
        await axios.delete('/api/products?id=' + productId);
        goBack();
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-16 mx-auto text-red-500 mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <h1 className="mb-2">Delete Product</h1>
                <p className="text-gray-600 mb-6 text-lg">
                    Are you sure you want to delete <span className="font-semibold text-gray-900">"{productInfo?.title}"</span>?
                    <br />
                    <span className="text-sm text-gray-500">This action cannot be undone.</span>
                </p>
                <div className="flex gap-3 justify-center">
                    <button className="btn-default" onClick={goBack}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 inline-block mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                        </svg>
                        Cancel
                    </button>
                    <button className="btn-red" onClick={deleteProduct}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 inline-block mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        Yes, Delete
                    </button>
                </div>
            </div>
        </Layout>
    );
}