import React, { useState, useEffect } from 'react';
import axios from '../../../../utils/axiosConfig';

const initialForm = {
  type: '',
  hotline: '',
  description: '',
  status: 'Active',
  contact_person: '',
  email: '',
  procedure: '',
};

const EmergencyHotlinesTable = () => {
  const [hotlines, setHotlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchHotlines = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/emergency-hotlines');
      setHotlines(res.data);
    } catch (err) {
      setError('Failed to fetch hotlines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotlines();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEditModal = (hotline) => {
    setEditId(hotline.id);
    setForm({
      ...hotline,
      procedure: Array.isArray(hotline.procedure) ? hotline.procedure.join('\n') : (hotline.procedure || ''),
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        procedure: form.procedure.split('\n').map((s) => s.trim()).filter(Boolean),
        last_updated: new Date().toISOString().split('T')[0],
      };
      if (editId) {
        await axios.put(`/emergency-hotlines/${editId}`, payload);
      } else {
        await axios.post('/emergency-hotlines', payload);
      }
      setShowModal(false);
      fetchHotlines();
    } catch (err) {
      setError('Failed to save hotline');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hotline?')) return;
    setLoading(true);
    setError('');
    try {
      await axios.delete(`/emergency-hotlines/${id}`);
      fetchHotlines();
    } catch (err) {
      setError('Failed to delete hotline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-red-700">Emergency Hotlines</h2>
        <button
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2 rounded-xl shadow flex items-center gap-2 font-semibold transition-all duration-300"
          onClick={openAddModal}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Hotline
        </button>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border rounded-lg overflow-hidden bg-white shadow">
          <thead className="bg-red-100 text-black text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Hotline</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Contact Person</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Last Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-red-50">
            {hotlines.map((h) => (
              <tr key={h.id} className="hover:bg-red-50/70 transition">
                <td className="px-4 py-3 font-semibold text-red-700">{h.type}</td>
                <td className="px-4 py-3 font-mono text-red-800">{h.hotline}</td>
                <td className="px-4 py-3 max-w-xs truncate" title={h.description}>{h.description}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${h.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{h.status}</span>
                </td>
                <td className="px-4 py-3">{h.contact_person}</td>
                <td className="px-4 py-3">{h.email}</td>
                <td className="px-4 py-3">{h.last_updated}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEditModal(h)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Edit</button>
                  <button onClick={() => handleDelete(h.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg space-y-4"
          >
            <h2 className="text-xl font-bold mb-2">{editId ? 'Edit' : 'Add'} Emergency Hotline</h2>
            <input name="type" value={form.type} onChange={handleChange} required placeholder="Type (e.g. Fire, Flood)" className="w-full border rounded px-4 py-2" />
            <input name="hotline" value={form.hotline} onChange={handleChange} required placeholder="Hotline Number" className="w-full border rounded px-4 py-2" />
            <input name="description" value={form.description} onChange={handleChange} required placeholder="Description" className="w-full border rounded px-4 py-2" />
            <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-4 py-2">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <input name="contact_person" value={form.contact_person} onChange={handleChange} placeholder="Contact Person" className="w-full border rounded px-4 py-2" />
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border rounded px-4 py-2" />
            <textarea name="procedure" value={form.procedure} onChange={handleChange} placeholder="Step-by-step procedure (one step per line)" className="w-full border rounded px-4 py-2" rows={4} />
            <div className="flex gap-4 mt-4">
              <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmergencyHotlinesTable; 