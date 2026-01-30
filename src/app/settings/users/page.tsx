'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Trash2, Edit, Shield, User, Mail } from 'lucide-react';
import Link from 'next/link';

export default function UserManagementPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '', // Only for create
        role: 'user', // user, accountant
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                console.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setModalMode('create');
        setFormData({ name: '', email: '', password: '', role: 'user' });
        setShowModal(true);
    };

    const handleEdit = (user: any) => {
        setModalMode('edit');
        setCurrentUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role || 'user'
        });
        setShowModal(true);
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const res = await fetch(`/api/users?id=${userId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setUsers(users.filter(u => u.id !== userId));
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = '/api/users';
            const method = modalMode === 'create' ? 'POST' : 'PUT';
            const body = modalMode === 'create'
                ? formData
                : { ...formData, id: currentUser.id };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setShowModal(false);
                fetchUsers(); // Refresh list
            } else {
                const error = await res.json();
                alert(error.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error submitting user form:', error);
            alert('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-lekhya-base">
            <div className="lekhya-header z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <h1 className="font-bold text-lg tracking-wide">LekhyaAI <span className="text-gray-400 text-sm font-normal">/ Settings / User Management</span></h1>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-lekhya-accent outline-none"
                            />
                        </div>
                        <button
                            onClick={handleCreate}
                            className="bg-lekhya-primary text-white px-6 py-2.5 rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            Add New User
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-gray-500">Loading users...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                {searchTerm ? 'No users match your search.' : 'No users found. Create one to get started.'}
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">
                                                        {(user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-800">{user.name || 'Unnamed User'}</div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Mail className="w-3 h-3" /> {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase
                                                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                        user.role === 'accountant' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'}`}>
                                                    <Shield className="w-3 h-3" />
                                                    {user.role}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span>
                                                <span className="text-sm font-medium text-gray-600">Active</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors bg-white border border-gray-200 p-2 rounded-lg hover:border-blue-300"
                                                        title="Edit User"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors bg-white border border-gray-200 p-2 rounded-lg hover:border-red-300"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">
                                {modalMode === 'create' ? 'Add New User' : 'Edit User'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lekhya-primary outline-none"
                                        placeholder="e.g. John Doe"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        disabled={modalMode === 'edit'}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lekhya-primary outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                        placeholder="user@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Password - Required for Create, Optional for Edit */}
                            {(modalMode === 'create' || formData.password) && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        {modalMode === 'edit' ? 'New Password (Optional)' : 'Password'}
                                    </label>
                                    <input
                                        type="password"
                                        required={modalMode === 'create'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lekhya-primary outline-none"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lekhya-primary outline-none"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="user">User (Standard)</option>
                                    <option value="accountant">Accountant</option>
                                    <option value="viewer">Viewer (Read Only)</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-2.5 bg-lekhya-primary text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Saving...' : (modalMode === 'create' ? 'Create User' : 'Save Changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
