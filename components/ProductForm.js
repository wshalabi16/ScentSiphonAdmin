"use client";

import { useState, useEffect } from "react";  
import axios from "axios";
import { useRouter } from "next/navigation";    
import Spinner from "./Spinner"; 
import { ReactSortable } from "react-sortablejs"; 

export default function ProductForm({_id, title:existingTitle, description:existingDescription, price:existingPrice, images:existingImages}) {
    
        const [title, setTitle] = useState(existingTitle || '');
        const [description, setDescription] = useState(existingDescription || '');
        const [price, setPrice] = useState(existingPrice || '');
        const [images, setImages] = useState(existingImages || []);
        const [goToProducts, setGoToProducts] = useState(false);
        const [isUploading, setIsUploading] = useState(false);
        const router = useRouter();
    
        useEffect(() => {
            if (goToProducts) {
                router.push('/products');
            }
        }, [goToProducts, router]);
    
        async function saveProduct(event) {
            event.preventDefault();
            const data = {title, description, price, images};
            if (_id) {
                // Update existing product
                await axios.put('/api/products', {...data, _id});
            } else {
                // Create new product
                await axios.post('/api/products', data);
            }
            setGoToProducts(true);
        }

        async function uploadImages(event) {
            const files = event.target?.files;
            if (files?.length > 0) {
                setIsUploading(true);
                const data = new FormData();
                for (const file of files) {
                    data.append('file', file);
                }
                const response = await axios.post('/api/upload', data);
                setImages(oldImages => {
                    return [...oldImages, ...response.data.links];
                });
                setIsUploading(false);
            }
        }

        function updateImagesOrder(images) {
            setImages(images);
        }
        
        return (
                <form onSubmit={saveProduct}>
                <label>Product Name:</label>
                <input type="text" placeholder="Product Name" value={title} onChange={event  => setTitle(event.target.value)}/>
                <label>Photos</label>
                <div className="mb-2 flex flex-wrap gap-1">
                    <ReactSortable list={images} setList={updateImagesOrder} className="flex flex-wrap gap-1">
                    {!!images?.length && images.map(link => (
                        <div key={link} className="h-24">
                            <img src={link} alt="" className="rounded-lg" />
                        </div>
                    ))}
                    </ReactSortable>                   
                    {isUploading &&(
                        <div className="h-32 flex items-center justify-center rounded-lg">
                            <Spinner/>
                        </div>
                    )}
                    <label className="w-32 h-32 rounded-lg text-center flex flex-col items-center justify-center gap-1 text-sm text-gray-500 bg-white hover:bg-gray-100 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                        <div>Upload Images</div>
                        <input type="file" onChange={uploadImages} className="hidden"/>
                    </label>
                </div>
                <label>Product Description:</label>
                <textarea placeholder="Product Description" value={description} onChange={event => setDescription(event.target.value)}/>
                <label>Price (in CAD):</label>
                <input type="number" placeholder="Price" value={price} onChange={event => setPrice(event.target.value)}/>
                <button type="submit" className="btn-primary">Save Product</button>
                </form>
        );    
}