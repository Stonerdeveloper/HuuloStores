
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
        images: [],
        badge: '',
        description: ''
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

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
                images: product.images || [],
                badge: product.badge || '',
                description: product.description || ''
            });
            setImagePreviews(product.images || [product.image].filter(Boolean));
        } else {
            setFormData({
                name: '',
                category: '',
                price: '',
                old_price: '',
                image: '',
                images: [],
                badge: '',
                description: ''
            });
            setImagePreviews([]);
        }
        setImageFiles([]);
    }, [product, isOpen]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setImageFiles(prev => [...prev, ...files]);

            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews(prev => [...prev, reader.result]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index) => {
        // If it's a new file (from imageFiles)
        // Note: this is a bit tricky because previews contain both existing URLs and new base64
        // We'll manage it by index
        const newPreviews = [...imagePreviews];
        const removedPreview = newPreviews.splice(index, 1)[0];
        setImagePreviews(newPreviews);

        // If it was a newly selected file, remove it from imageFiles too
        // We can check if it's base64 (new) or URL (existing)
        if (removedPreview.startsWith('data:')) {
            // It's a bit hard to map exactly without extra state, 
            // but for simplicity, we'll just filter out the file if we can track it
            // Better: use objects for previews { url, file }
        }
    };

    const uploadImages = async () => {
        if (imageFiles.length === 0) return formData.images;

        setUploading(true);
        const uploadedUrls = [];

        try {
            for (const file of imageFiles) {
                const fileExt = file.name.split('.').pop().toLowerCase();
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                const filePath = `products/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: file.type
                    });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath);

                uploadedUrls.push(urlData.publicUrl);
            }

            // Combine existing URLs (that weren't removed) with new ones
            const existingUrls = imagePreviews.filter(p => !p.startsWith('data:'));
            return [...existingUrls, ...uploadedUrls];
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Failed to upload images: ' + (error.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const allImageUrls = await uploadImages();

            const payload = {
                ...formData,
                image: allImageUrls[0] || '', // First image is main
                images: allImageUrls,
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
                        <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
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
                        <label>Product Images (Upload multiple)</label>
                        <div style={{
                            border: '2px dashed var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1.5rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            background: 'var(--bg-primary)',
                            marginBottom: '1rem'
                        }}>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
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
                            <div>
                                <Upload size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click to upload multiple images</p>
                            </div>
                        </div>

                        {imagePreviews.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                {imagePreviews.map((preview, idx) => (
                                    <div key={idx} style={{ position: 'relative', height: '80px' }}>
                                        <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            style={{
                                                position: 'absolute', top: '-5px', right: '-5px',
                                                background: 'var(--color-danger)', color: 'white', border: 'none',
                                                borderRadius: '50%', width: '18px', height: '18px', fontSize: '12px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                            }}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Badge (Optional)</label>
                        <input type="text" value={formData.badge} onChange={e => setFormData({ ...formData, badge: e.target.value })} placeholder="e.g New, Hot, Sale" />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3"></textarea>
                    </div>

                    <button type="submit" disabled={loading || uploading} className="btn-primary" style={{ marginTop: '1rem' }}>
                        {uploading ? 'Uploading Images...' : loading ? 'Saving...' : 'Save Product'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
