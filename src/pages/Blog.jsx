
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Calendar, ArrowRight } from 'lucide-react';
import './Blog.css';

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('published', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching posts:', error);
            } else {
                setPosts(data || []);
            }
            setLoading(false);
        };

        fetchPosts();
    }, []);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="blog-page container">
                <div className="blog-header">
                    <h1>Blog</h1>
                </div>
                <p style={{ textAlign: 'center', padding: '2rem' }}>Loading posts...</p>
            </div>
        );
    }

    return (
        <div className="blog-page container">
            <div className="blog-header">
                <h1>Our <span className="text-accent">Blog</span></h1>
                <p>Latest news, updates, and gaming tips</p>
            </div>

            {posts.length === 0 ? (
                <div className="no-posts">
                    <p>No blog posts yet. Check back soon!</p>
                </div>
            ) : (
                <div className="blog-grid">
                    {posts.map(post => (
                        <article key={post.id} className="blog-card">
                            {post.cover_image && (
                                <Link to={`/blog/${post.slug}`} className="blog-card-image">
                                    <img src={post.cover_image} alt={post.title} />
                                </Link>
                            )}
                            <div className="blog-card-content">
                                <div className="blog-card-meta">
                                    <Calendar size={14} />
                                    <span>{formatDate(post.created_at)}</span>
                                </div>
                                <Link to={`/blog/${post.slug}`}>
                                    <h2 className="blog-card-title">{post.title}</h2>
                                </Link>
                                {post.excerpt && (
                                    <p className="blog-card-excerpt">{post.excerpt}</p>
                                )}
                                <Link to={`/blog/${post.slug}`} className="blog-card-link">
                                    Read More <ArrowRight size={16} />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Blog;
