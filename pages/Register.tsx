
import React, { useState } from 'react';
import { UserRole } from '../types';
import { mockStore } from '../services/mockStore';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    role: UserRole.USER
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role: UserRole) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.username) {
        setError('Please fill in all required fields.');
        return;
    }

    const result = mockStore.register(formData);
    if (result.success) {
        onRegisterSuccess();
    } else {
        setError(result.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-black text-white p-6 text-center">
            <h2 className="text-2xl font-bold">Create Account</h2>
            <p className="text-gray-400 text-sm">Join the POS Wallet community</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => handleRoleSelect(UserRole.USER)}
                        className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                            formData.role === UserRole.USER 
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' 
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                    >
                        User 👤
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRoleSelect(UserRole.AGENT)}
                        className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                            formData.role === UserRole.AGENT 
                            ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold' 
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                    >
                        Agent 🏪
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="name" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input type="text" name="username" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" name="password" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" name="phone" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black" />
            </div>

            <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-colors">
                Sign Up
            </button>
        </form>

        <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
            <p className="text-sm text-gray-600">Already have an account? <button onClick={onNavigateToLogin} className="text-blue-600 font-bold">Log In</button></p>
        </div>
      </div>
    </div>
  );
};
