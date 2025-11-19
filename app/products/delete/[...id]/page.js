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
            <h1 className="text-center">Are you sure you want to delete "{productInfo?.title}"?</h1>
            <div className="flex gap-2 justify-center">
                <button className="btn-red" onClick={deleteProduct}>Yes</button>
                <button className="btn-default" onClick={goBack}>No</button>
            </div>
            
        </Layout>
    );
}