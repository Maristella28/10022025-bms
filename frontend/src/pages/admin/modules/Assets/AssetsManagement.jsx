import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../../utils/axiosConfig';
import Navbar from "../../../../components/Navbar";
import Sidebar from "../../../../components/Sidebar";
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  XMarkIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  TagIcon,
  CubeIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/solid";

const StatCard = ({ label, value, icon, iconBg }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex justify-between items-center group">
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-3xl font-bold text-green-600 group-hover:text-emerald-600 transition">{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
      {icon}
    </div>
  </div>
);

const badge = (text, color, icon = null) => (
  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
    {icon && icon}
    {text}
  </span>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'in_stock':
      return 'bg-green-100 text-green-800';
    case 'limited':
      return 'bg-yellow-100 text-yellow-800';
    case 'available':
      return 'bg-blue-100 text-blue-800';
    case 'out_of_stock':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'in_stock':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'limited':
      return <ClockIcon className="w-3 h-3" />;
    case 'available':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'out_of_stock':
      return <ExclamationTriangleIcon className="w-3 h-3" />;
    default:
      return <ClockIcon className="w-3 h-3" />;
  }
};

const initialForm = {
  name: '',
  description: '',
  image: '',
  price: '',
  category: '',
  stock: '',
  status: 'in_stock',
  available_dates: [],
};

const AssetsManagement = () => {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [datePickerDates, setDatePickerDates] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredAssets, setFilteredAssets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    setFilteredAssets(
      assets.filter((asset) =>
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.category.toLowerCase().includes(search.toLowerCase()) ||
        asset.description.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, assets]);

  const fetchAssets = () => {
    setLoading(true);
    axiosInstance.get('/assets')
      .then(res => setAssets(res.data))
      .catch(() => alert('Failed to load assets'))
      .finally(() => setLoading(false));
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDatesChange = (dates) => {
    setDatePickerDates(dates);
    setForm({
      ...form,
      available_dates: dates.map(d => d.toISOString().slice(0, 10)),
    });
  };

  const handleCreate = async e => {
    e.preventDefault();
    console.log('Submitting available_dates:', form.available_dates);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('category', form.category);
      formData.append('stock', form.stock);
      formData.append('status', form.status);
      formData.append('available_dates', JSON.stringify(form.available_dates));
      if (form.image) formData.append('image', form.image);

      const res = await axiosInstance.post('/assets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAssets([...assets, res.data]);
      setForm(initialForm);
      alert('Asset created!');
    } catch (err) {
      alert('Failed to create asset');
    }
  };

  const handleEdit = (asset) => {
    setEditingId(asset.id);
    setForm({
      name: asset.name,
      description: asset.description,
      image: asset.image,
      price: asset.price,
      category: asset.category,
      stock: asset.stock,
      status: asset.status,
      available_dates: asset.available_dates || [],
    });
    setDatePickerDates((asset.available_dates || []).map(date => new Date(date)));
  };

  const handleUpdate = async e => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('category', form.category);
      formData.append('stock', form.stock);
      formData.append('status', form.status);
      formData.append('available_dates', JSON.stringify(form.available_dates));
      if (form.image) formData.append('image', form.image);

        const res = await axiosInstance.patch(`/assets/${editingId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAssets(assets.map(a => a.id === editingId ? res.data : a));
      setEditingId(null);
      setForm(initialForm);
      alert('Asset updated!');
    } catch (err) {
      alert('Failed to update asset');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
  await axiosInstance.delete(`/assets/${id}`);
      setAssets(assets.filter(a => a.id !== id));
      alert('Asset deleted!');
    } catch (err) {
      alert('Failed to delete asset');
    }
  };

  const getStatusCount = (status) => {
    return assets.filter(asset => asset.status === status).length;
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <BuildingOfficeIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Assets Management
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Comprehensive management system for barangay assets with real-time inventory tracking and availability scheduling.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Assets"
              value={assets.length}
              icon={<BuildingOfficeIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
            />
            <StatCard
              label="In Stock"
              value={getStatusCount('in_stock')}
              icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600" />}
              iconBg="bg-emerald-100"
            />
            <StatCard
              label="Limited"
              value={getStatusCount('limited')}
              icon={<ClockIcon className="w-6 h-6 text-yellow-600" />}
              iconBg="bg-yellow-100"
            />
            <StatCard
              label="Out of Stock"
              value={getStatusCount('out_of_stock')}
              icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-600" />}
              iconBg="bg-red-100"
            />
          </div>

          {/* Enhanced Search and Add Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex gap-3">
                <button onClick={() => navigate('/admin/inventoryassets')} className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                  <ArchiveBoxIcon className="w-5 h-5" />
                  ← Back to Inventory
                </button>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                  <PlusIcon className="w-5 h-5" />
                  Create New Asset
                </button>
              </div>

              <div className="flex gap-3 items-center w-full max-w-md">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                    placeholder="Search by name, category, or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                </div>
                <button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300">
                  <FunnelIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* CREATE/UPDATE FORM */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              {editingId ? <PencilIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
              {editingId ? 'Edit Asset' : 'Create New Asset'}
            </h2>
            <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <TagIcon className="w-4 h-4" />
                    Asset Name
                  </label>
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={handleFormChange} 
                    placeholder="Enter asset name" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <CubeIcon className="w-4 h-4" />
                    Category
                  </label>
                  <input 
                    name="category" 
                    value={form.category} 
                    onChange={handleFormChange} 
                    placeholder="Enter category" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    Price
                  </label>
                  <input 
                    name="price" 
                    type="number" 
                    value={form.price} 
                    onChange={handleFormChange} 
                    placeholder="Enter price" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <ArchiveBoxIcon className="w-4 h-4" />
                    Stock
                  </label>
                  <input 
                    name="stock" 
                    type="number" 
                    value={form.stock} 
                    onChange={handleFormChange} 
                    placeholder="Enter stock quantity" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <PhotoIcon className="w-4 h-4" />
                    Image
                  </label>
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={e => setForm({ ...form, image: e.target.files[0] })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4" />
                    Status
                  </label>
                  <select 
                    name="status" 
                    value={form.status} 
                    onChange={handleFormChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="limited">Limited</option>
                    <option value="available">Available</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleFormChange} 
                  placeholder="Enter asset description" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300" 
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  Available Dates
                </label>
                <DatePicker
                  selected={null}
                  onChange={handleDatesChange}
                  startDate={null}
                  endDate={null}
                  selectsRange={false}
                  inline
                  highlightDates={datePickerDates}
                  includeDates={null}
                  minDate={new Date()}
                  multiple={false}
                  selectsMultiple
                  selectedDates={datePickerDates}
                  value={undefined}
                  customInput={undefined}
                  className="w-full border border-gray-300 rounded-xl"
                />
                <div className="text-xs text-gray-500 mt-2">
                  Selected: {form.available_dates.join(', ')}
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                >
                  {editingId ? 'Update Asset' : 'Create Asset'}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => { setEditingId(null); setForm(initialForm); }} 
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Enhanced Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5" />
                List of Assets
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Category</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Price</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Stock</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Image</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <BuildingOfficeIcon className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 font-medium">No assets found</p>
                          <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-green-50 transition-all duration-200 group">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{asset.name}</div>
                          {asset.description && (
                            <div className="text-xs text-gray-500 mt-1">{asset.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                            {asset.category}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-green-600">
                            ₱{asset.price}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-gray-700">
                            {asset.stock}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {badge(
                            asset.status.replace('_', ' ').toUpperCase(), 
                            getStatusColor(asset.status), 
                            getStatusIcon(asset.status)
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {asset.image && (
                            <img
                              src={asset.image.startsWith('/storage/') ? `http://localhost:8000${asset.image}` : asset.image}
                              alt={asset.name}
                              className="w-16 h-16 object-cover rounded-lg shadow-md"
                            />
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(asset)}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                            >
                              <PencilIcon className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(asset.id)}
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                            >
                              <XMarkIcon className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AssetsManagement; 