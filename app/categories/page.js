"use client";

import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import Spinner from "@/components/Spinner";

export default function Categories() {
    const [editedCategory, setEditedCategory] = useState(null);
    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);
    const [parentCategory, setParentCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = 'Categories | Scent Siphon Admin';
        fetchCategories();
    }, []);

    async function fetchCategories() {
        setLoading(true);
        setError(null);

        try {
            const result = await axios.get('/api/categories');
            setCategories(result.data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setError('Failed to load categories. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function saveCategory(e) {
        e.preventDefault();
        const data = { name, parentCategory };
        
        if (editedCategory) {
            data._id = editedCategory._id;
            await axios.put('/api/categories', data);
        } else {
            await axios.post('/api/categories', data);
        }
        setEditedCategory(null);
        setName('');
        setParentCategory('');
        fetchCategories();
    }

    function editCategory(category) {
        setEditedCategory(category);
        setName(category.name);
        setParentCategory(category.parent?._id || '');
    }

    function deleteCategory(category) {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${category.name}?`,
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Yes, Delete',
            confirmButtonColor: '#d55',
            reverseButtons: true,
        }).then(async result => {
            if (result.isConfirmed) {
                const { _id } = category;
                await axios.delete('/api/categories?_id=' + _id);
                fetchCategories();
            }
        });
    }

    function cancelEdit() {
        setEditedCategory(null);
        setName('');
        setParentCategory('');
    }

    return (
        <Layout>
            <h1>Categories</h1>
            <label>{editedCategory ? `Edit Category: ${editedCategory.name}` : 'Create New Category'}</label>
            <form onSubmit={saveCategory}>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        placeholder="Category Name"
                        onChange={e => setName(e.target.value)}
                        value={name}
                    />
                    <select
                        value={parentCategory}
                        onChange={e => setParentCategory(e.target.value)}
                    >
                        <option value="">No Parent Category</option>
                        {categories.length > 0 && categories.map(category => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2">
                    {editedCategory && (
                        <button type="button" onClick={cancelEdit} className="btn-default">Cancel</button>
                    )}
                    <button type="submit" className="btn-primary">Save</button>
                </div>
            </form>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <Spinner />
                    <span className="ml-2">Loading categories...</span>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded p-4 my-4">
                    <p className="text-red-800">{error}</p>
                    <button onClick={fetchCategories} className="btn-default mt-2">
                        Retry
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && !editedCategory && categories.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <p>No categories yet. Create your first category!</p>
                </div>
            )}

            {!editedCategory && !loading && !error && categories.length > 0 && (
                <table className="basic mt-4">
                    <thead>
                        <tr>
                            <td>Category Name</td>
                            <td>Parent Category</td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length > 0 && categories.map(category => (
                            <tr key={category._id}>
                                <td>{category.name}</td> 
                                <td>{category?.parent?.name}</td>
                                <td>
                                    <button onClick={() => editCategory(category)} className="btn-primary text-sm py-1 px-3 mr-2">Edit</button>
                                    <button onClick={() => deleteCategory(category)} className="btn-red text-sm py-1 px-3">Delete</button>
                                </td>       
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </Layout>
    );
}