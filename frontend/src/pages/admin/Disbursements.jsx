import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import { PlusIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/solid';

const Disbursements = () => {
  const [disbursements, setDisbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [beneficiaries, setBeneficiaries] = useState([]);

  const fetchDisbursements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/disbursements');
      setDisbursements(res.data);
    } catch (err) {
      setError('Failed to fetch disbursements');
    } finally {
      setLoading(false);
    }
  };

  const fetchBeneficiaries = async () => {
    try {
      const res = await axios.get('/beneficiaries');
      setBeneficiaries(res.data);
    } catch (err) {
      setError('Failed to fetch beneficiaries');
    }
  };

  useEffect(() => {
    fetchDisbursements();
    fetchBeneficiaries();
  }, []);

  const handleEdit = (record) => {
    setEditData(record);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editData.id) {
        await axios.put(`/disbursements/${editData.id}`, editData);
      } else {
        await axios.post('/disbursements', editData);
      }
      setShowModal(false);
      fetchDisbursements();
    } catch (err) {
      setError('Failed to save disbursement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this disbursement?')) return;
    setLoading(true);
    setError('');
    try {
      await axios.delete(`/disbursements/${id}`);
      fetchDisbursements();
    } catch (err) {
      setError('Failed to delete disbursement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-gradient-to-br from-green-50 to-white min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-4">Disbursements</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-4 py-2 rounded">
        <PlusIcon className="w-5 h-5 inline" /> Add Disbursement
      </button>
      <table className="min-w-full mt-4">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Remarks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {disbursements.map((disbursement) => (
            <tr key={disbursement.id}>
              <td>{disbursement.date}</td>
              <td>{disbursement.amount}</td>
              <td>{disbursement.method}</td>
              <td>{disbursement.remarks}</td>
              <td>
                <button onClick={() => handleEdit(disbursement)} className="text-blue-600">
                  <PencilIcon className="w-5 h-5 inline" /> Edit
                </button>
                <button onClick={() => handleDelete(disbursement.id)} className="text-red-600 ml-2">
                  <XMarkIcon className="w-5 h-5 inline" /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form onSubmit={handleSave} className="bg-white rounded p-6">
            <h2 className="text-xl font-bold mb-4">{editData.id ? 'Edit' : 'Add'} Disbursement</h2>
            <select
              name="beneficiary_id"
              value={editData.beneficiary_id || ''}
              onChange={(e) => setEditData({ ...editData, beneficiary_id: e.target.value })}
              required
              className="border rounded p-2 mb-2 w-full"
            >
              <option value="">Select Beneficiary</option>
              {beneficiaries.map((beneficiary) => (
                <option key={beneficiary.id} value={beneficiary.id}>
                  {beneficiary.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="date"
              value={editData.date || ''}
              onChange={(e) => setEditData({ ...editData, date: e.target.value })}
              required
              className="border rounded p-2 mb-2 w-full"
            />
            <input
              type="number"
              name="amount"
              value={editData.amount || ''}
              onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
              required
              placeholder="Amount"
              className="border rounded p-2 mb-2 w-full"
            />
            <input
              type="text"
              name="method"
              value={editData.method || ''}
              onChange={(e) => setEditData({ ...editData, method: e.target.value })}
              placeholder="Payment Method"
              className="border rounded p-2 mb-2 w-full"
            />
            <textarea
              name="remarks"
              value={editData.remarks || ''}
              onChange={(e) => setEditData({ ...editData, remarks: e.target.value })}
              placeholder="Remarks"
              className="border rounded p-2 mb-2 w-full"
            />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
              Save
            </button>
            <button type="button" onClick={() => setShowModal(false)} className="bg-gray-300 text-black px-4 py-2 rounded ml-2">
              Cancel
            </button>
          </form>
        </div>
      )}
    </main>
  );
};

export default Disbursements;
