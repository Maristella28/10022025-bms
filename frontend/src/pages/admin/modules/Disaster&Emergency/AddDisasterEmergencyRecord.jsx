import React, { useState } from 'react';
import axios from '../../../../utils/axiosConfig';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const AddDisasterEmergencyRecord = ({ onSuccess }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: '',
    date: '',
    location: '',
    description: '',
    actions_taken: '',
    casualties: '',
    reported_by: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customType, setCustomType] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/disaster-emergencies', form);
      setShowForm(false);
      setForm({
        type: '',
        date: '',
        location: '',
        description: '',
        actions_taken: '',
        casualties: '',
        reported_by: '',
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
        onClick={() => setShowForm(true)}
      >
        <ExclamationTriangleIcon className="w-5 h-5" />
        Add Disaster and Emergency records
      </button>
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg space-y-4"
          >
            <h2 className="text-xl font-bold mb-2">Add Disaster/Emergency Record</h2>
            {error && <div className="text-red-600">{error}</div>}
            {/* Disaster Type Dropdown */}
            <label className="block text-sm font-semibold text-gray-700">Disaster Type</label>
            <select
              name="type"
              value={form.type}
              onChange={e => {
                handleChange(e);
                if (e.target.value !== 'Other') setCustomType('');
              }}
              required
              className="w-full border rounded px-4 py-2 mb-2"
            >
              <option value="">Select Type</option>
              <option value="Fire">Fire</option>
              <option value="Flood">Flood</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Typhoon">Typhoon</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Other">Other</option>
            </select>
            {form.type === 'Other' && (
              <input
                type="text"
                placeholder="Enter custom disaster type"
                value={customType}
                onChange={e => {
                  setCustomType(e.target.value);
                  setForm({ ...form, type: e.target.value });
                }}
                className="w-full border rounded px-4 py-2 mb-2"
                required
              />
            )}
            <input name="date" value={form.date} onChange={handleChange} required type="date" className="w-full border rounded px-4 py-2" />
            <input name="location" value={form.location} onChange={handleChange} required placeholder="Location" className="w-full border rounded px-4 py-2" />
            <textarea name="description" value={form.description} onChange={handleChange} required placeholder="Description" className="w-full border rounded px-4 py-2" />
            <textarea name="actions_taken" value={form.actions_taken} onChange={handleChange} placeholder="Actions Taken" className="w-full border rounded px-4 py-2" />
            <input name="casualties" value={form.casualties} onChange={handleChange} placeholder="Casualties (optional)" className="w-full border rounded px-4 py-2" />
            <input name="reported_by" value={form.reported_by} onChange={handleChange} placeholder="Reported By (optional)" className="w-full border rounded px-4 py-2" />
            <div className="flex gap-4 mt-4">
              <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AddDisasterEmergencyRecord; 