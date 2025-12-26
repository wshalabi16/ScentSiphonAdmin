"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs"; 

export default function ProductForm({
    _id, 
    title: existingTitle, 
    description: existingDescription, 
    price: existingPrice, 
    images: existingImages, 
    category: assignedCategory,
    variants: existingVariants,
    featured: existingFeatured,
}) {
    const [title, setTitle] = useState(existingTitle || '');
    const [description, setDescription] = useState(existingDescription || '');
    const [category, setCategory] = useState(assignedCategory?._id || assignedCategory || '');
    const [images, setImages] = useState(existingImages || []);
    const [variants, setVariants] = useState([{ size: '', price: '', sku: '', stock: 0 }]);
    const [goToProducts, setGoToProducts] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [featured, setFeatured] = useState(existingFeatured || false); 
    const router = useRouter();

    useEffect(() => {
        if (existingVariants && existingVariants.length > 0) {
            setVariants(existingVariants.map(v => ({
                size: v.size || '',
                price: v.price || '',
                sku: v.sku || '',
                stock: v.stock || 0
            })));
        }
    }, [existingVariants]);

    useEffect(() => {
        if (goToProducts) {
            router.push('/products');
        }
    }, [goToProducts]);

    useEffect(() => {
        axios.get('/api/categories')
            .then(result => {
                setCategories(result.data);
            })
            .catch(error => {
                console.error('Failed to fetch categories:', error);
                setError('Failed to load categories. Please refresh the page.');
            });
    }, []);

    function getBasePrice(variantsArray) {
        const prices = variantsArray
            .map(v => parseFloat(v.price))
            .filter(p => !isNaN(p) && p > 0);

        if (prices.length === 0) {
            throw new Error('At least one variant must have a valid price');
        }

        return Math.min(...prices);
    }

    async function saveProduct(e) {
        e.preventDefault();
        setError('');
        
        if (!title || title.trim() === '') {
            setError('Product name is required');
            return;
        }
        
        if (!description || description.trim() === '') {
            setError('Product description is required');
            return;
        }
        
        const validVariants = variants.filter(v => 
            v.size && v.size.trim() !== '' && 
            v.price && parseFloat(v.price) > 0
        );
        
        if (validVariants.length === 0) {
            setError('Please add at least one variant with size and price');
            return;
        }
        
        setIsSaving(true);
        
        try {
            const price = getBasePrice(validVariants);
            const data = { 
                title, 
                description, 
                price, 
                images, 
                category, 
                variants: validVariants,
                featured,  
            };
            
            if (_id) {
                await axios.put('/api/products', { ...data, _id });
            } else {
                await axios.post('/api/products', data);
            }
            setGoToProducts(true);
        } catch (error) {
            console.error('Failed to save product:', error);
            setError('Failed to save product. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }

    async function uploadImages(e) {
        const files = e.target?.files;
        if (files?.length > 0) {
            setIsUploading(true);
            setError('');

            try {
                const data = new FormData();
                for (const file of files) {
                    data.append('file', file);
                }
                const response = await axios.post('/api/upload', data);
                setImages(oldImages => [...oldImages, ...response.data.links]);
            } catch (error) {
                console.error('Failed to upload images:', error);
                setError(error.response?.data?.error || 'Failed to upload images. Please try again.');
            } finally {
                setIsUploading(false);
            }
        }
    }

    function updateImagesOrder(newImages) {
        setImages(newImages || []);
    }

    async function removeImage(linkToRemove) {
        try {
            // Extract filename from S3 URL
            const filename = linkToRemove.split('/').pop();

            // Delete from S3
            await axios.delete(`/api/upload?filename=${filename}`);

            // Remove from state
            setImages(prev => prev.filter(link => link !== linkToRemove));
        } catch (error) {
            console.error('Failed to delete image:', error);
            setError('Failed to delete image from storage. Please try again.');
        }
    }

    function isValidImageUrl(url) {
        if (!url || typeof url !== 'string') return false;
        return url.startsWith('https://') || url.startsWith('http://');
    }

    function addVariant() {
        setVariants(prev => [...prev, { size: '', price: '', sku: '', stock: 0 }]);
    }

    function handleVariantChange(index, field, value) {
        setVariants(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
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
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            <label>Product Name</label>
            <input
                type="text"
                placeholder="Product Name"
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={isSaving}
                autoComplete="off"
            />

            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} disabled={isSaving}>
                <option value="">Uncategorized</option>
                {categories.length > 0 && categories.map(category => (
                    <option key={category._id} value={category._id}>
                        {category.name}
                    </option>
                ))}
            </select>

            <label>Photos</label>
            <div className="mb-2 flex flex-wrap gap-1">
                <ReactSortable
                    list={images || []}
                    setList={updateImagesOrder}
                    className="flex flex-wrap gap-1"
                >
                    {!!images?.length && images.map((link, index) => (
                        <div key={link} className="h-24 w-24 relative group">
                            <img
                                src={link}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                    console.error('Failed to load image:', link);
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(link)}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
                                aria-label={`Remove image ${index + 1}`}
                                disabled={isSaving}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </ReactSortable>
                {isUploading && (
                    <div className="h-24 flex items-center justify-center rounded-lg">
                        <Spinner/>
                    </div>
                )}
                <label className={`w-24 h-24 rounded-lg flex items-center justify-center text-xs text-gray-500 bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors duration-200 p-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <div className="text-center">Upload Images</div>
                    <input type="file" onChange={uploadImages} className="hidden" multiple accept="image/*" disabled={isSaving}/>
                </label>
            </div>

            <label>Product Description</label>
            <textarea
                placeholder="Product Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={isSaving}
            />
            
            <label className="block mb-1">Size Variants</label>
            <p className="text-sm text-gray-500 mb-3">
                Base price will be automatically set to the lowest variant price
            </p>

            {variants.map((variant, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                    <input
                        type="text"
                        value={variant.size}
                        className="mb-0"
                        onChange={e => handleVariantChange(index, 'size', e.target.value)}
                        placeholder="Size (e.g., 5ml)"
                        disabled={isSaving}
                    />
                    <input
                        type="number"
                        value={variant.price}
                        className="mb-0"
                        onChange={e => handleVariantChange(index, 'price', e.target.value)}
                        placeholder="Price"
                        disabled={isSaving}
                    />
                    <input
                        type="text"
                        value={variant.sku}
                        className="mb-0"
                        onChange={e => handleVariantChange(index, 'sku', e.target.value)}
                        placeholder="SKU (optional)"
                        disabled={isSaving}
                    />
                    <input
                        type="number"
                        value={variant.stock}
                        className="mb-0 w-24"
                        onChange={e => handleVariantChange(index, 'stock', e.target.value)}
                        placeholder="Quantity"
                        disabled={isSaving}
                    />
                    {variants.length > 1 && (
                        <button onClick={() => removeVariant(index)} type="button" className="btn-red text-sm py-2 px-3" disabled={isSaving}>Remove</button>
                    )}
                </div>
            ))}

            <button onClick={addVariant} type="button" className="btn-default mb-4"disabled={isSaving}>Add Size Option</button>

            <div className="mb-4">
                <label className={`flex items-center gap-2 ${isSaving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                    disabled={isSaving}
                />
                <span>Feature this product on homepage</span>
                </label>
            </div>

            <button type="submit" className="btn-primary"disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Product'}</button>
        </form>
    );    
}