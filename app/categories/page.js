"use client";

import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from 'sweetalert2';

export default function Categories() {
    const [editedCategory, setEditedCategory] = useState(null);
    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);
    const [parentCategory, setParentCategory] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    function fetchCategories() {
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
        });
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
                <div className="flex gap-1">
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
                
                <div className="flex gap-1">
                    {editedCategory && (
                        <button type="button" onClick={cancelEdit} className="btn-default py-1">Cancel</button>
                    )}
                    <button type="submit" className="btn-primary py-1">Save</button>
                </div>
            </form>
            
            {!editedCategory && (
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
                                    <button onClick={() => editCategory(category)} className="btn-primary mr-1">Edit</button>
                                    <button onClick={() => deleteCategory(category)} className="btn-red mr-1">Delete</button>
                                </td>       
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </Layout>
    );
}