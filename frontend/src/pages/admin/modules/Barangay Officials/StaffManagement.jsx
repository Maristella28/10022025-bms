import React, { useEffect, useState } from 'react';
import axios from '../../../../utils/axiosConfig';
import Navbar from "../../../../components/Navbar";
import Sidebar from "../../../../components/Sidebar";
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaUsers, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const fallbackAvatar = '/assets/images/logo.jpg';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [currentStaff, setCurrentStaff] = useState(null);
  const [form, setForm] = useState({ name: '', position: '', image: null, description: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Define the order and options for staff positions
  const staffPositions = [
    'Barangay Captain',
    'Barangay Secretary',
    'Barangay Treasurer',
    'SK Chairman',
    'Barangay Clerk',
    'Barangay Health Worker',
    'Barangay Tanod',
    'Barangay Utility',
    'Other'
  ];
  const positionOrder = staffPositions.reduce((acc, pos, idx) => { acc[pos.toLowerCase()] = idx; return acc; }, {});

  // Fetch staff
  const fetchStaff = () => {
    setLoading(true);
    setError(null);
    axios.get('/organizational-chart/staff')
      .then(res => setStaff(res.data))
      .catch(() => setError('Failed to load staff.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Open modal for add/edit
  const openModal = (type, staffMember = null) => {
    setModalType(type);
    setCurrentStaff(staffMember);
    setForm(staffMember ? {
      name: staffMember.name || '',
      position: staffMember.position || '',
      image: null, // always reset file input
      description: staffMember.description || '',
    } : { name: '', position: '', image: null, description: '' });
    setImagePreview(staffMember && staffMember.image ? staffMember.image : null);
    setShowModal(true);
  };

  // Handle form input
  const handleChange = e => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setForm(f => ({ ...f, [name]: files[0] }));
      setImagePreview(files[0] ? URL.createObjectURL(files[0]) : null);
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Save (add or edit)
  const handleSave = () => {
    setSaving(true);
    setFeedback('');
    const data = new FormData();
    data.append('name', form.name);
    data.append('position', form.position);
    data.append('description', form.description);
    data.append('role', 'staff');
    if (form.image) {
      data.append('image', form.image);
    }
    const apiCall = modalType === 'add'
      ? axios.post('/admin/officials', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : axios.put(`/admin/officials/${currentStaff.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    apiCall.then(() => {
      setShowModal(false);
      setFeedback('Staff saved successfully!');
      fetchStaff();
    }).catch(() => {
      setFeedback('Failed to save staff.');
    }).finally(() => setSaving(false));
  };

  // Delete
  const handleDelete = id => {
    setDeletingId(id);
    setFeedback('');
    axios.delete(`/admin/officials/${id}`)
      .then(() => {
        setFeedback('Staff deleted successfully!');
        fetchStaff();
      })
      .catch(() => setFeedback('Failed to delete staff.'))
      .finally(() => setDeletingId(null));
  };

  const getImageUrl = (img) => {
    if (!img) return fallbackAvatar;
    if (img.startsWith('/storage/')) return `http://localhost:8000${img}`;
    return img;
  };

  // Sort staff by position order before filtering
  const sortedStaff = [...staff].sort((a, b) => {
    const aOrder = positionOrder[a.position?.toLowerCase()] ?? 999;
    const bOrder = positionOrder[b.position?.toLowerCase()] ?? 999;
    return aOrder - bOrder;
  });
  const filteredStaff = sortedStaff.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.position.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/admin/barangayOfficials')}
            className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl border-2 border-blue-200 rounded-full shadow-lg text-blue-700 font-semibold hover:bg-blue-100 hover:text-blue-900 hover:shadow-blue-300/60 hover:scale-105 transition-all duration-200 z-20 group mb-4"
            style={{ boxShadow: '0 4px 16px 0 rgba(59,130,246,0.15)' }}
            title="Back to Barangay Officials"
          >
            <FaArrowLeft className="text-blue-500 text-xl" />
            <span className="text-base sm:text-lg">Back</span>
          </button>

          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-xl mb-4">
              <FaUsers className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
              Barangay Staff Records
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Comprehensive management system for barangay staff with detailed profiles and real-time updates.
            </p>
          </div>

          {/* Stat Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex justify-between items-center group">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-3xl font-bold text-blue-600 group-hover:text-purple-600 transition">{staff.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
                <FaUsers className="text-blue-600" size={28} />
              </div>
            </div>
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div className={`mb-4 px-4 py-3 rounded-lg font-semibold flex items-center justify-between shadow transition-all duration-300 animate-fade-in-up ${feedback.includes('success') ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
              <span>{feedback}</span>
              <button className="ml-4 text-lg font-bold text-blue-700 hover:text-blue-900" onClick={() => setFeedback('')} aria-label="Dismiss message">&times;</button>
            </div>
          )}

          {/* Search and Add Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <button
                onClick={() => openModal('add')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <FaPlus className="w-5 h-5" />
                Add Staff
              </button>
              <div className="flex gap-3 items-center w-full max-w-md">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                    placeholder="Search staff by name or position..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <span className="absolute left-4 top-3.5 text-gray-400">
                    <svg width="20" height="20" fill="currentColor"><path d="M19.707 18.293l-4.387-4.387A7.928 7.928 0 0016 8a8 8 0 10-8 8 7.928 7.928 0 005.906-2.68l4.387 4.387a1 1 0 001.414-1.414zM8 14a6 6 0 110-12 6 6 0 010 12z"/></svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <FaUsers className="w-5 h-5" />
                Staff Records
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Photo</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Position</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Description</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-500 font-medium">Loading staff...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <FaUsers className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 font-medium">No staff found</p>
                          <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map(staffMember => (
                      <tr key={staffMember.id} className="hover:bg-blue-50 transition-all duration-200 group">
                        <td className="px-6 py-4">
                          <img src={getImageUrl(staffMember.image)} alt={staffMember.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 bg-white shadow" onError={e => { e.target.onerror = null; e.target.src = fallbackAvatar; }} />
                        </td>
                        <td className="px-4 py-4 font-semibold text-blue-900">{staffMember.name}</td>
                        <td className="px-4 py-4">{staffMember.position}</td>
                        <td className="px-4 py-4">{staffMember.description || <span className="text-gray-400">N/A</span>}</td>
                        <td className="px-4 py-4 flex gap-2">
                          <button
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                            onClick={() => openModal('edit', staffMember)}
                            aria-label="Edit"
                          >
                            <FaEdit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                            onClick={() => window.confirm('Are you sure you want to delete this staff member?') && handleDelete(staffMember.id)}
                            aria-label="Delete"
                            disabled={deletingId === staffMember.id}
                          >
                            <FaTrash className="w-4 h-4" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                }
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal for Add/Edit */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
              <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl shadow-2xl border border-blue-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-slideInUp">
                {/* Sticky Modal Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-3xl p-8 sticky top-0 z-10 flex flex-col gap-2 shadow-md">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-extrabold text-white flex items-center gap-3 tracking-tight drop-shadow-lg">
                      {modalType === 'add' ? <><FaPlus className="w-7 h-7" /> Add Staff</> : <><FaEdit className="w-7 h-7" /> Edit Staff</>}
                    </h2>
                    <button 
                      onClick={() => setShowModal(false)}
                      className="text-white hover:text-red-200 transition-colors duration-200 text-2xl font-bold"
                    >
                      <FaTimes className="w-7 h-7" />
                    </button>
                  </div>
                </div>
                <div className="p-10 space-y-10 bg-gradient-to-br from-white/80 to-blue-50/80 rounded-b-3xl animate-fadeIn">
                  <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                    <div className="mb-3">
                      <label className="block text-blue-800 font-semibold mb-1">Name</label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400" required />
                    </div>
                    <div className="mb-3">
                      <label className="block text-blue-800 font-semibold mb-1">Position</label>
                      <select
                        name="position"
                        value={form.position}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400"
                        required
                      >
                        <option value="">Select position</option>
                        {staffPositions.map(pos => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="block text-blue-800 font-semibold mb-1">Photo</label>
                      <input type="file" name="image" accept="image/*" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 bg-white" />
                      {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-full border-2 border-blue-300 shadow" />
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="block text-blue-800 font-semibold mb-1">Description</label>
                      <textarea name="description" value={form.description} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400" rows={2} />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <button type="button" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition flex items-center gap-1" onClick={() => setShowModal(false)}><FaTimes /> Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition flex items-center gap-1" disabled={saving}><FaSave /> {saving ? 'Saving...' : 'Save'}</button>
                    </div>
                  </form>
                </div>
              </div>
              <style>{`
                @keyframes fadeIn {
                  0% { opacity: 0; }
                  100% { opacity: 1; }
                }
                .animate-fadeIn { animation: fadeIn 0.7s ease; }
                @keyframes slideInUp {
                  0% { opacity: 0; transform: translateY(40px); }
                  100% { opacity: 1; transform: translateY(0); }
                }
                .animate-slideInUp { animation: slideInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1); }
              `}</style>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default StaffManagement; 