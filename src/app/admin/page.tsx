'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Couple {
  id: number;
  name: string;
  displayTitle: string;
  createdAt: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [couples, setCouples] = useState<Couple[]>([]);
  const [newCouple, setNewCouple] = useState({ name: '', displayTitle: '' });
  const [editingCouple, setEditingCouple] = useState<Couple | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCouples();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Tom4z123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const fetchCouples = async () => {
    try {
      const res = await fetch('/api/admin/couples');
      const data = await res.json();
      setCouples(data.couples);
    } catch (err) {
      console.error('Error fetching couples:', err);
    }
  };

  const handleCreateCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/couples', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCouple),
      });

      if (res.ok) {
        setNewCouple({ name: '', displayTitle: '' });
        fetchCouples();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create couple');
      }
    } catch (err) {
      setError('Error creating couple');
    }
  };

  const handleEditClick = (couple: Couple) => {
    setEditingCouple(couple);
    setEditTitle(couple.displayTitle || '');
  };

  const handleEditSave = async () => {
    if (!editingCouple) return;
    try {
      const res = await fetch(`/api/admin/couples/${editingCouple.name}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayTitle: editTitle }),
      });
      if (res.ok) {
        setEditingCouple(null);
        setEditTitle('');
        fetchCouples();
      } else {
        setError('Failed to update couple');
      }
    } catch {
      setError('Failed to update couple');
    }
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm('Are you sure you want to delete this couple?')) return;
    try {
      const res = await fetch(`/api/admin/couples/${name}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCouples();
      } else {
        setError('Failed to delete couple');
      }
    } catch {
      setError('Failed to delete couple');
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-pink-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-pink-700 mb-6 text-center">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-700 mb-8">Admin Panel</h1>
        
        {/* Create New Couple Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-pink-600 mb-4">Add New Couple</h2>
          <form onSubmit={handleCreateCouple} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                URL Name (e.g., lucijaandrej)
              </label>
              <input
                type="text"
                id="name"
                value={newCouple.name}
                onChange={(e) => setNewCouple({ ...newCouple, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
                pattern="[a-z0-9]+"
                title="Only lowercase letters and numbers allowed"
              />
            </div>
            <div>
              <label htmlFor="displayTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Display Title (e.g., Lucija & Andrej)
              </label>
              <input
                type="text"
                id="displayTitle"
                value={newCouple.displayTitle}
                onChange={(e) => setNewCouple({ ...newCouple, displayTitle: e.target.value })}
                className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors"
            >
              Add Couple
            </button>
          </form>
        </div>

        {/* Couples List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-pink-600 mb-4">Existing Couples</h2>
          <div className="space-y-4">
            {couples.map((couple) => (
              <div
                key={couple.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-pink-50"
              >
                <div>
                  {editingCouple?.id === couple.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="px-2 py-1 border rounded"
                      />
                      <button
                        onClick={handleEditSave}
                        className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCouple(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-medium text-gray-900">{couple.displayTitle}</h3>
                      <p className="text-sm text-gray-500">URL: /u/{couple.name}</p>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/u/${couple.name}`)}
                    className="text-pink-500 hover:text-pink-600"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditClick(couple)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(couple.name)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 