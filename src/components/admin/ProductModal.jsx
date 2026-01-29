
import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
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
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

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
            setImagePreview(product.image);
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
            setImagePreview('');
        }
        setImageFile(null);
    }, [product, isOpen]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return formData.image; // Return existing URL if no new file

        setUploading(true);
        console.log('Starting image upload...', imageFile.name, imageFile.size, imageFile.type);

        try {
            const fileExt = imageFile.name.split('.').pop().toLowerCase();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `products/${fileName}`;

            console.log('Uploading to path:', filePath);

            const { data, error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, imageFile, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: imageFile.type
                });

            console.log('Upload response:', { data, uploadError });

            if (uploadError) {
                console.error('Upload error details:', uploadError);
                throw uploadError;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            console.log('Public URL:', urlData.publicUrl);
            return urlData.publicUrl;
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Failed to upload image: ' + (error.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Upload image if there's a new file
            const imageUrl = await uploadImage();

            const payload = {
                ...formData,
                image: imageUrl,
                price: Number(formData.price),
                old_price: formData.old_price ? Number(formData.old_price) : null
            };

            if (product) {
                // Update - FIXED: removed .select().single()
                const { error } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', product.id);

                if (error) throw error;

                // Fetch the updated product separately
                const { data: updatedProduct } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', product.id)
                    .single();

                onSave(updatedProduct, 'update');
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
                        <label>Product Image</label>
                        <div style={{
                            border: '2px dashed var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1.5rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            position: 'relative'
                        }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    opacity: 0,
                                    cursor: 'pointer'
                                }}
                            />
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-md)' }} />
                            ) : (
                                <div>
                                    <Upload size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click to upload image</p>
                                </div>
                            )}
                        </div>
                        {imageFile && <p style={{ fontSize: '0.85rem', color: 'var(--color-success)', marginTop: '0.5rem' }}>✓ {imageFile.name}</p>}
                    </div>

                    <div className="form-group">
                        <label>Badge (Optional)</label>
                        <input type="text" value={formData.badge} onChange={e => setFormData({ ...formData, badge: e.target.value })} placeholder="e.g New, Hot, Sale" />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}></textarea>
                    </div>

                    <button type="submit" disabled={loading || uploading} className="btn-primary" style={{ marginTop: '1rem' }}>
                        {uploading ? 'Uploading Image...' : loading ? 'Saving...' : 'Save Product'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
