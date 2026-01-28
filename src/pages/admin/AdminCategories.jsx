
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Trash2 } from 'lucide-react';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const { data } = await supabase.from('categories').select('*').order('name');
        if (data) setCategories(data);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryName.trim()) return;

        if (editingCategory) {
            // Update
            const { data, error } = await supabase
                .from('categories')
                .update({ name: categoryName.trim() })
                .eq('id', editingCategory.id)
                .select()
                .single();

            if (error) {
                alert('Error updating category: ' + error.message);
            } else {
                setCategories(categories.map(c => c.id === editingCategory.id ? data : c));
                setCategoryName('');
                setEditingCategory(null);
            }
        } else {
            // Add
            const { data, error } = await supabase
                .from('categories')
                .insert([{ name: categoryName.trim() }])
                .select()
                .single();

            if (error) {
                alert('Error adding category: ' + error.message);
            } else {
                setCategories([...categories, data]);
                setCategoryName('');
            }
        }
    };

    const handleEdit = (category) => {
        setCategoryName(category.name);
        setEditingCategory(category);
    };

    const handleCancel = () => {
        setCategoryName('');
        setEditingCategory(null);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;

        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) {
            alert('Error deleting category');
        } else {
            setCategories(categories.filter(c => c.id !== id));
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h1>Categories</h1>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Category Name"
                        style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                    <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {editingCategory ? 'Update' : <><Plus size={18} /> Add</>}
                    </button>
                    {editingCategory && (
                        <button type="button" onClick={handleCancel} className="btn-text" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0 1rem' }}>
                            Cancel
                        </button>
                    )}
                </form>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td>{cat.id}</td>
                                <td>{cat.name}</td>
                                <td>
                                    <button className="action-btn btn-edit" onClick={() => handleEdit(cat)} style={{ marginRight: '0.5rem' }}>Edit</button>
                                    <button className="action-btn btn-delete" onClick={() => handleDelete(cat.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCategories;
