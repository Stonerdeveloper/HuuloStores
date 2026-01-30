
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, X as CloseIcon } from 'lucide-react';

const AdminBlog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPost, setCurrentPost] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        cover_image: '',
        published: false
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts:', error);
        } else {
            setPosts(data || []);
        }
        setLoading(false);
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setFormData({
            ...formData,
            title,
            slug: currentPost ? formData.slug : generateSlug(title)
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return formData.cover_image;

        setUploading(true);
        try {
            const fileExt = imageFile.name.split('.').pop().toLowerCase();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `blog/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, imageFile, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: imageFile.type
                });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            return urlData.publicUrl;
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Failed to upload cover image: ' + (error.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const coverImageUrl = await uploadImage();

            const postData = {
                ...formData,
                cover_image: coverImageUrl
            };

            if (currentPost) {
                // Update
                const { error } = await supabase
                    .from('blog_posts')
                    .update({
                        ...postData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentPost.id);

                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('blog_posts')
                    .insert([postData]);

                if (error) throw error;
            }

            resetForm();
            fetchPosts();
        } catch (error) {
            alert('Error saving post: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (post) => {
        setCurrentPost(post);
        setFormData({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || '',
            content: post.content,
            cover_image: post.cover_image || '',
            published: post.published
        });
        setIsEditing(true);
        setImagePreview(post.cover_image || '');
        setImageFile(null);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting post');
        } else {
            fetchPosts();
        }
    };

    const togglePublished = async (post) => {
        const { error } = await supabase
            .from('blog_posts')
            .update({ published: !post.published })
            .eq('id', post.id);

        if (!error) fetchPosts();
    };

    const resetForm = () => {
        setCurrentPost(null);
        setFormData({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            cover_image: '',
            published: false
        });
        setImageFile(null);
        setImagePreview('');
        setIsEditing(false);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div>
            <div className="admin-header">
                <h1>Blog Posts</h1>
                {!isEditing && (
                    <button className="btn-primary" onClick={() => setIsEditing(true)}>
                        <Plus size={18} /> New Post
                    </button>
                )}
            </div>

            {isEditing ? (
                <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>{currentPost ? 'Edit Post' : 'New Post'}</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={handleTitleChange}
                                placeholder="Post Title"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Slug (URL)</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="post-url-slug"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Cover Image</label>
                            <div style={{
                                border: '2px dashed var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                padding: '1.5rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                background: 'var(--bg-primary)'
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
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-md)' }} />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setImagePreview('');
                                                setImageFile(null);
                                                setFormData({ ...formData, cover_image: '' });
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '-10px',
                                                right: '-10px',
                                                background: 'var(--color-danger)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                align_items: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                zIndex: 1
                                            }}
                                        >
                                            <CloseIcon size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <Upload size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click to upload cover image</p>
                                    </div>
                                )}
                            </div>
                            {imageFile && <p style={{ fontSize: '0.85rem', color: 'var(--color-success)', marginTop: '0.5rem' }}>✓ {imageFile.name}</p>}
                        </div>

                        <div className="form-group">
                            <label>Excerpt (Short Description)</label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                rows="2"
                                placeholder="A brief summary of the post..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Content</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows="10"
                                placeholder="Write your blog post content here..."
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="published"
                                checked={formData.published}
                                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                            />
                            <label htmlFor="published" style={{ margin: 0, cursor: 'pointer' }}>Publish immediately</label>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn-primary" disabled={loading || uploading}>
                                {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Save Post'}
                            </button>
                            <button type="button" onClick={resetForm} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="admin-table-container">
                    {loading ? (
                        <p style={{ padding: '2rem', textAlign: 'center' }}>Loading posts...</p>
                    ) : posts.length === 0 ? (
                        <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No blog posts yet. Create your first post!</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map(post => (
                                    <tr key={post.id}>
                                        <td>
                                            <strong>{post.title}</strong>
                                            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/blog/{post.slug}</span>
                                        </td>
                                        <td>{formatDate(post.created_at)}</td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                background: post.published ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: post.published ? 'var(--color-success)' : 'var(--color-danger)'
                                            }}>
                                                {post.published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="action-btn" onClick={() => togglePublished(post)} title={post.published ? 'Unpublish' : 'Publish'}>
                                                    {post.published ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                                <button className="action-btn btn-edit" onClick={() => handleEdit(post)}>
                                                    <Edit size={16} />
                                                </button>
                                                <button className="action-btn btn-delete" onClick={() => handleDelete(post.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminBlog;
