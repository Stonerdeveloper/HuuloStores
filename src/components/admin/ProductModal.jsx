
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const ProductModal = ({ product, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        old_price: '',
        image: '',
        badge: '',
        description: ''
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('*').order('name');
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                category: product.category,
                price: product.price,
                old_price: product.old_price || '',
                image: product.image,
                badge: product.badge || '',
                description: product.description || ''
            });
        } else {
            setFormData({
                name: '',
                category: '',
                price: '',
                old_price: '',
                image: '',
                badge: '',
                description: ''
            });
        }
    }, [product, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            price: Number(formData.price),
            old_price: formData.old_price ? Number(formData.old_price) : null
        };

        try {
            if (product) {
                // Update
                const { data, error } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', product.id)
                    .select()
                    .single();

                if (error) throw error;
                onSave(data, 'update');
            } else {
                // Insert
                const { data, error } = await supabase
                    .from('products')
                    .insert([payload])
                    .select()
                    .single();

                if (error) throw error;
                onSave(data, 'create');
            }
            onClose();
        } catch (error) {
            alert('Error saving product: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)',
                width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                        <label>Product Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g PS5 Console" />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Price (₦)</label>
                            <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Old Price (Optional)</label>
                            <input type="number" value={formData.old_price} onChange={e => setFormData({ ...formData, old_price: e.target.value })} placeholder="0.00" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Image URL</label>
                        <input required type="url" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
                    </div>

                    <div className="form-group">
                        <label>Badge (Optional)</label>
                        <input type="text" value={formData.badge} onChange={e => setFormData({ ...formData, badge: e.target.value })} placeholder="e.g New, Hot, Sale" />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}></textarea>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem' }}>
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
