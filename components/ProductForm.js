"use client";

import { useState, useEffect } from "react";  
import axios from "axios";
import { useRouter } from "next/navigation";    
import Spinner from "./Spinner"; 
import { ReactSortable } from "react-sortablejs"; 

export default function ProductForm({
    _id, 
    title: existingTitle, 
    description: existingDescription, 
    price: existingPrice, 
    images: existingImages, 
    category: assignedCategory,
    variants: existingVariants
}) {
    const [title, setTitle] = useState(existingTitle || '');
    const [description, setDescription] = useState(existingDescription || '');
    const [category, setCategory] = useState(assignedCategory || '');
    const [images, setImages] = useState(existingImages || []);
    const [variants, setVariants] = useState(() => {
    // Make sure existingVariants exists and has data
    if (existingVariants && existingVariants.length > 0) {
        // Ensure all fields are properly typed
        return existingVariants.map(v => ({
            size: v.size || '',
            price: v.price || '',
            sku: v.sku || '',
            stock: v.stock || 0
        }));
    }
    // Default to one empty variant
    return [{ size: '', price: '', sku: '', stock: 0 }];
    });
    const [goToProducts, setGoToProducts] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const router = useRouter();

    useEffect(() => {
        if (goToProducts) {
            router.push('/products');
        }
    }, [goToProducts, router]);

    useEffect(() => {
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
        });
    }, []);

    function getBasePrice() {
        const prices = variants
            .map(v => parseFloat(v.price))
            .filter(p => !isNaN(p) && p > 0);
        return prices.length > 0 ? Math.min(...prices) : 0;
    }

    async function saveProduct(e) {
        e.preventDefault();
        const price = getBasePrice(); 
        const data = { title, description, price, images, category, variants };
        if (_id) {
            await axios.put('/api/products', { ...data, _id });
        } else {
            await axios.post('/api/products', data);
        }
        setGoToProducts(true);
    }

    async function uploadImages(e) {
        const files = e.target?.files;
        if (files?.length > 0) {
            setIsUploading(true);
            const data = new FormData();
            for (const file of files) {
                data.append('file', file);
            }
            const response = await axios.post('/api/upload', data);
            setImages(oldImages => [...oldImages, ...response.data.links]);
            setIsUploading(false);
        }
    }

    function updateImagesOrder(images) {
        setImages(images);
    }

    function addVariant() {
        setVariants(prev => [...prev, { size: '', price: '', sku: '', stock: 0 }]);
    }

    function handleVariantChange(index, field, value) {
        setVariants(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    }

    function removeVariant(indexToRemove) {
        if (variants.length > 1) {
            setVariants(prev => prev.filter((_, index) => index !== indexToRemove));
        }
    }
    
    return (
        <form onSubmit={saveProduct}>
            <label>Product Name</label>
            <input type="text" placeholder="Product Name" value={title} onChange={e => setTitle(e.target.value)}/>
            <label>Category</label>

            <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Uncategorized</option>
                {categories.length > 0 && categories.map(category => (
                    <option key={category._id} value={category._id}>
                        {category.name}
                    </option>
                ))}
            </select>

            <label>Photos</label>

            <div className="mb-2 flex flex-wrap gap-1">
                <ReactSortable list={images} setList={updateImagesOrder} className="flex flex-wrap gap-1">
                    {!!images?.length && images.map(link => (
                        <div key={link} className="h-24">
                            <img src={link} alt="" className="rounded-lg" />
                        </div>
                    ))}
                </ReactSortable>                   
                {isUploading && (
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

            <label>Product Description</label>
            <textarea placeholder="Product Description" value={description} onChange={e => setDescription(e.target.value)}/>
            <label className="block mb-1">Size Variants</label>
            <p className="text-sm text-gray-500 mb-2">Base price will be automatically set to the lowest variant price</p>

            {variants.map((variant, index) => (
                <div key={index} className="flex gap-1 mb-2">
                    <input 
                        type="text" 
                        value={variant.size} 
                        className="mb-0" 
                        onChange={e => handleVariantChange(index, 'size', e.target.value)}  
                        placeholder="Size (e.g., 5ml)"
                    />
                    <input 
                        type="number" 
                        value={variant.price} 
                        className="mb-0" 
                        onChange={e => handleVariantChange(index, 'price', e.target.value)}  
                        placeholder="Price"
                    />
                    <input 
                        type="text" 
                        value={variant.sku} 
                        className="mb-0" 
                        onChange={e => handleVariantChange(index, 'sku', e.target.value)}  
                        placeholder="SKU (optional)"
                    />
                    <input
                        type="number" 
                        value={variant.stock} 
                        className="mb-0 w-24" 
                        onChange={e => handleVariantChange(index, 'stock', e.target.value)}  
                        placeholder="Quantity"
                    />
                    {variants.length > 1 && (
                        <button onClick={() => removeVariant(index)} type="button" className="btn-red">Remove</button>
                    )}
                </div>
            ))}

            <button onClick={addVariant} type="button" className="btn-default text-sm mb-2">Add Size Option</button>
            <button type="submit" className="btn-primary">Save Product</button>
        </form>
    );    
}