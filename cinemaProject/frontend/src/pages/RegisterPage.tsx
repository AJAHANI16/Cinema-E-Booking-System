import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { register, isAuthenticated, isLoading, error, clearError } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Clear errors when component mounts
    useEffect(() => {
        clearError();
    }, []); // Only run on mount

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        if (formData.password !== formData.password_confirm) {
            alert("Passwords don't match!");
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            await register(formData);
            // Navigation will happen automatically due to useEffect above
        } catch (error) {
            // Error is handled by the auth context
            console.error('Registration error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-8">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-8">Create Account</h1>
                
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        <div className="text-sm font-semibold mb-2">Registration Error:</div>
                        <div className="whitespace-pre-line text-sm">
                            {error}
                        </div>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                                First Name (Optional)
                            </label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isSubmitting}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name (Optional)
                            </label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                            Username *
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password *
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password *
                        </label>
                        <input
                            type="password"
                            id="password_confirm"
                            name="password_confirm"
                            value={formData.password_confirm}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                    >
                        {isSubmitting ? 'Creating Account...' : 'Register'}
                    </button>
                    
                    <div className="mt-4 text-center">
                        <Link to="/login" className="text-blue-500 hover:text-blue-600 hover:underline">
                            Already have an account? Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
