
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Reusing styles

const Signup = () => {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        const { error, data } = await signUp({ email, password });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Success - check if email confirmation is required (Supabase default)
            if (data?.session) {
                navigate('/');
            } else {
                setMessage('Account created! Please check your email to verify your account.');
                setLoading(false);
            }
        }
    };

    return (
        <div className="auth-page container">
            <div className="auth-card">
                <h1>Create Account</h1>
                <p className="auth-subtitle">Join HuuloStores today</p>

                {error && <div className="auth-error">{error}</div>}
                {message && <div className="auth-error" style={{ borderColor: 'var(--color-success)', color: 'var(--color-success)', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>{message}</div>}

                <form onSubmit={handleSignup} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Create a password"
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm your password"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-auth">
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
