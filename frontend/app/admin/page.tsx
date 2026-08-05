'use client';

import { useEffect, useState } from 'react';

interface MenuItem {
  id: string; name: string; description: string | null;
  price: number; imageUrl: string | null;
  category: string; available: boolean; sortOrder: number;
}

interface Analytics {
  todayOrders: number; todayRevenue: number;
  allTimeRevenue: number;
  topItems: Array<{ name: string; sold: number }>;
}

const CATEGORIES = ['Hot Drinks', 'Cold Drinks', 'Food', 'Pastries', 'Other'];
const EMPTY_FORM = { name: '', description: '', price: '', imageUrl: '', category: 'Hot Drinks', available: true, sortOrder: '0' };

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [tab, setTab] = useState<'menu' | 'analytics'>('menu');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://telegramminiapp-production-f419.up.railway.app';
  const headers = { 'Content-Type': 'application/json', 'x-admin-password': password };

  const fetchItems = async () => {
    const res = await fetch(`${apiUrl}/api/admin/menu`, { headers });
    if (res.ok) setItems((await res.json()).items);
  };

  const fetchAnalytics = async () => {
    const res = await fetch(`${apiUrl}/api/admin/analytics`, { headers });
    if (res.ok) setAnalytics(await res.json());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${apiUrl}/api/admin/menu`, { headers });
    if (res.ok) { setItems((await res.json()).items); setAuthed(true); fetchAnalytics(); }
    else setError('Wrong password.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const body = { ...form, price: parseFloat(form.price), sortOrder: parseInt(form.sortOrder) };
    const url = editId ? `${apiUrl}/api/admin/menu/${editId}` : `${apiUrl}/api/admin/menu`;
    const res = await fetch(url, { method: editId ? 'PUT' : 'POST', headers, body: JSON.stringify(body) });
    if (res.ok) { await fetchItems(); setForm(EMPTY_FORM); setEditId(null); }
    setSaving(false);
  };

  const handleEdit = (item: MenuItem) => {
    setEditId(item.id);
    setForm({ name: item.name, description: item.description ?? '', price: String(item.price), imageUrl: item.imageUrl ?? '', category: item.category, available: item.available, sortOrder: String(item.sortOrder) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await fetch(`${apiUrl}/api/admin/menu/${id}`, { method: 'DELETE', headers });
    await fetchItems();
  };

  const handleToggle = async (item: MenuItem) => {
    await fetch(`${apiUrl}/api/admin/menu/${item.id}`, { method: 'PUT', headers, body: JSON.stringify({ available: !item.available }) });
    await fetchItems();
  };

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8"><div className="text-5xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your password to manage the menu</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input type="password" placeholder="Admin password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full py-3 rounded-2xl bg-blue-500 text-white font-bold">Enter</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">☕ Admin Panel</h1>
        <div className="flex gap-2">
          {(['menu', 'analytics'] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); if (t === 'analytics') fetchAnalytics(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${tab === t ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {t === 'menu' ? '🍽️ Menu' : '📊 Analytics'}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto flex flex-col gap-6">
        {tab === 'menu' && (
          <>
            {/* Add/Edit form */}
            <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
              <h2 className="font-bold text-gray-900">{editId ? '✏️ Edit Item' : '➕ Add Item'}</h2>
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" />
              <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2} className="input-field resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" min="0" step="0.01" placeholder="Price (EGP)" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <input placeholder="Image URL (optional)" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="input-field" />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })}
                    className="w-4 h-4 accent-blue-500" />
                  Available
                </label>
                <input type="number" placeholder="Sort order" value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  className="input-field w-24 ml-auto" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-bold disabled:opacity-50">
                  {saving ? 'Saving…' : editId ? 'Update' : 'Add Item'}
                </button>
                {editId && (
                  <button type="button" onClick={() => { setEditId(null); setForm(EMPTY_FORM); }}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Item list */}
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center text-2xl">
                    {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : '🍽️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${item.available ? 'text-gray-900' : 'text-gray-400 line-through'}`}>{item.name}</p>
                    <p className="text-xs text-gray-500">{item.category} • {item.price} EGP</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleToggle(item)}
                      className={`text-xs px-2 py-1 rounded-lg font-semibold ${item.available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {item.available ? 'On' : 'Off'}
                    </button>
                    <button onClick={() => handleEdit(item)} className="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-600 font-semibold">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-500 font-semibold">Del</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'analytics' && analytics && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Today's Orders", value: analytics.todayOrders, icon: '📦' },
                { label: "Today's Revenue", value: `${analytics.todayRevenue.toFixed(0)} EGP`, icon: '💰' },
                { label: 'All-Time Revenue', value: `${analytics.allTimeRevenue.toFixed(0)} EGP`, icon: '📈' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="text-2xl mb-1">{stat.icon}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">🏆 Top Items</h3>
              {analytics.topItems.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm font-bold text-gray-400 w-4">{i + 1}</span>
                  <span className="flex-1 text-sm text-gray-900">{item.name}</span>
                  <span className="text-sm font-semibold text-blue-500">{item.sold} sold</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .input-field {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          font-size: 14px;
          outline: none;
          background: #f9fafb;
          color: #111827;
        }
        .input-field:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px #dbeafe; }
      `}</style>
    </main>
  );
}
