
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Calendar, ArrowLeft } from 'lucide-react';
import './Blog.css';

const BlogPost = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('slug', slug)
                .eq('published', true)
                .single();

            if (error) {
                console.error('Error fetching post:', error);
            } else {
                setPost(data);
            }
            setLoading(false);
        };

        fetchPost();
        window.scrollTo(0, 0);
    }, [slug]);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="container blog-post-page">
                <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="container blog-post-page">
                <Link to="/blog" className="back-to-blog">
                    <ArrowLeft size={18} /> Back to Blog
                </Link>
                <h1>Post Not Found</h1>
                <p>The blog post you're looking for doesn't exist or has been removed.</p>
            </div>
        );
    }

    // Simple markdown-like rendering (paragraphs)
    const renderContent = (content) => {
        return content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
        ));
    };

    return (
        <div className="container blog-post-page">
            <Link to="/blog" className="back-to-blog">
                <ArrowLeft size={18} /> Back to Blog
            </Link>

            <article>
                <header className="blog-post-header">
                    <div className="blog-post-meta">
                        <Calendar size={16} />
                        <span>{formatDate(post.created_at)}</span>
                    </div>
                    <h1 className="blog-post-title">{post.title}</h1>
                </header>

                {post.cover_image && (
                    <img src={post.cover_image} alt={post.title} className="blog-post-cover" />
                )}

                <div className="blog-post-content">
                    {renderContent(post.content)}
                </div>
            </article>
        </div>
    );
};

export default BlogPost;
