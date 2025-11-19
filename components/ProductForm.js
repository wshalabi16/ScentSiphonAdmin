"use client";

import { useState, useEffect } from "react";  
import axios from "axios";
import { useRouter } from "next/navigation";    

export default function ProductForm({_id, title:existingTitle, description:existingDescription, price:existingPrice}) {
        const [title, setTitle] = useState(existingTitle || '');
        const [description, setDescription] = useState(existingDescription || '');
        const [price, setPrice] = useState(existingPrice || '');
        const [goToProducts, setGoToProducts] = useState(false);
        const router = useRouter();
    
        useEffect(() => {
            if (goToProducts) {
                router.push('/products');
            }
        }, [goToProducts, router]);
    
        async function saveProduct(event) {
            event.preventDefault();
            const data = {title, description, price};
            if (_id) {
                // Update existing product
                await axios.put('/api/products', {...data, _id});
            } else {
                // Create new product
                await axios.post('/api/products', data);
            }
            setGoToProducts(true);
        }
        
        return (
                <form onSubmit={saveProduct}>
                <label>Product Name:</label>
                <input type="text" placeholder="Product Name" value={title} onChange={event  => setTitle(event.target.value)}/>
                <label>Product Description:</label>
                <textarea placeholder="Product Description" value={description} onChange={event => setDescription(event.target.value)}/>
                <label>Price (in CAD):</label>
                <input type="number" placeholder="Price" value={price} onChange={event => setPrice(event.target.value)}/>
                <button type="submit" className="btn-primary">Save Product</button>
                </form>
        );    
}