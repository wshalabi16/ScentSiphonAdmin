"use client";
import Layout from "@/components/Layout";
import { useState } from "react";
import axios from "axios";

export default function NewProduct() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    async function createProduct(event) {
        event.preventDefault();
        const data = {title, description, price};
        await axios.post('/api/products', data);
    }
    return (
        <Layout>
            <form onSubmit={createProduct}>
            <h1>Add New Product</h1>
            <label>Product Name:</label>
            <input type="text" placeholder="Product Name" value={title} onChange={event  => setTitle(event.target.value)}/>
            <label>Product Description:</label>
            <textarea placeholder="Product Description" value={description} onChange={event => setDescription(event.target.value)}/>
            <label>Price (in CAD):</label>
            <input type="number" placeholder="Price" value={price} onChange={event => setPrice(event.target.value)}/>
            <button type="submit" className="btn-primary">Save Product</button>
            </form>
        </Layout>
    );
}