import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from '../../utils/axiosConfig';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  XMarkIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon,
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

const getDocumentTypeColor = (type) => {
  switch (type) {
    case 'Brgy Clearance':
      return 'bg-blue-100 text-blue-800';
    case 'Cedula':
      return 'bg-green-100 text-green-800';
    case 'Brgy Indigency':
      return 'bg-purple-100 text-purple-800';
    case 'Brgy Residency':
      return 'bg-orange-100 text-orange-800';
    case 'Brgy Business Permit':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getDocumentTypeIcon = (type) => {
  switch (type) {
    case 'Brgy Clearance':
      return <UserIcon className="w-3 h-3" />;
    case 'Cedula':
      return <UserIcon className="w-3 h-3" />;
    case 'Brgy Indigency':
      return <UserIcon className="w-3 h-3" />;
    case 'Brgy Residency':
      return <UserIcon className="w-3 h-3" />;
    case 'Brgy Business Permit':
      return <UserIcon className="w-3 h-3" />;
    default:
      return <UserIcon className="w-3 h-3" />;
  }
};

// No predefined records — fetch from backend on mount

const HouseholdRecords = () => {
  const navigate = useNavigate();
  const [recordsState, setRecordsState] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [residents, setResidents] = useState([]);
  const [residentSearch, setResidentSearch] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // debounce search input (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // update filteredRecords when debouncedSearch or recordsState changes
  useEffect(() => {
    const q = debouncedSearch.toLowerCase();
    setFilteredRecords(
      recordsState.filter((record) => {
        const name = (record && record.name) ? String(record.name).toLowerCase() : '';
        const householdId = (record && record.householdId) ? String(record.householdId).toLowerCase() : '';
        const docType = (record && record.documentType) ? String(record.documentType).toLowerCase() : '';
        return name.includes(q) || householdId.includes(q) || docType.includes(q);
      })
    );
  }, [debouncedSearch, recordsState]);

  // fetch households from backend on mount
  useEffect(() => {
    let mounted = true;
    const fetchHouseholds = async () => {
      try {
        const res = await api.get('/admin/households');
        if (!mounted) return;
        // normalize to frontend shape and tolerate different API shapes
        const raw = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.households)
              ? res.data.households
              : [];
        const list = raw.map(h => {
          const head = h.head_resident || h.head || null;
          const name = head ? `${head.first_name || head.firstName || ''} ${head.last_name || head.lastName || ''}`.trim() : (h.head_resident_name || h.head_name || h.name || '');
          return {
            id: h.id,
            householdId: h.household_no || h.householdId || h.householdNo || '',
            address: h.address || h.current_address || '',
            householdSize: h.members_count || h.membersCount || h.size || 0,
            head_resident_id: h.head_resident_id || h.headResidentId || null,
            name: name || '',
            householdHead: name || '',
            contactNumber: head ? (head.mobilenumber || head.mobile_number || head.contact_number || '') : (h.contactNumber || h.mobilenumber || ''),
            email: head ? (head.email || '') : (h.email || ''),
            nationalId: head ? (head.national_id || head.nationalId || '') : (h.nationalId || h.national_id || ''),
            age: head ? (head.age || '') : (h.age || ''),
            civilStatus: head ? (head.civil_status || head.civilStatus || '') : (h.civilStatus || h.civil_status || ''),
            gender: head ? (head.gender || '') : (h.gender || ''),
            documentType: h.document_type || h.documentType || '',
          };
        });
        setRecordsState(list);
      } catch (err) {
        console.warn('Could not fetch households', err?.response?.data || err.message);
      }
    };
    fetchHouseholds();
    return () => { mounted = false; };
  }, []);

  // validation: need either selected resident to promote or a provided name, plus householdSize > 0
  useEffect(() => {
    const hasName = editData.name && String(editData.name).trim().length > 0;
    const hasResident = !!editData.head_resident_id;
    const sizeOk = (typeof editData.householdSize === 'number' ? editData.householdSize > 0 : Number(editData.householdSize) > 0);
    setIsFormValid(Boolean((hasResident || hasName) && sizeOk));
  }, [editData]);

  const handleShowDetails = (record) => {
    if (selectedRecord?.id === record.id) {
      setSelectedRecord(null);
    } else {
      setSelectedRecord(record);
    }
  };

  const handleEdit = (record) => {
    // work with a shallow copy so editing doesn't mutate the list until saved
  setEditData({ ...record });
  fetchResidents();
  setShowModal(true);
  };

  const handleCreateHousehold = () => {
    navigate('/admin/create-household');
  };

  const fetchResidents = async () => {
    try {
      const res = await api.get('/admin/residents');
      const list = res.data.data ? res.data.data : (Array.isArray(res.data) ? res.data : (res.data.residents || []));
      const mapped = list.map(r => ({
        id: r.id,
        // external resident identifier (resident_id column) used for display
        resident_id: r.resident_id || r.residentId || r.resident_no || '',
        first_name: r.first_name || r.firstName || r.name || '',
        last_name: r.last_name || r.lastName || '',
        household_no: r.household_no || (r.profile && r.profile.household_no) || null,
  // prefer `mobilenumber` if the API uses that field name; fall back to other variants
  contactNumber: r.mobile_number || r.mobile_number || r.contact_number || r.contactNumber || r.phone || '',
  email: r.email || r.contactEmail || '',
  // demographic fields
  age: r.age || r.years_old || (r.profile && r.profile.age) || '',
  civilStatus: r.civil_status || r.civilStatus || (r.profile && r.profile.civil_status) || '',
  gender: r.gender || r.sex || (r.profile && r.profile.gender) || '',
      }));
      setResidents(mapped);
      // If modal was opened for an existing household that already has a head_resident_id,
      // prefill the display code and contact/email fields so the modal shows the values.
      if (editData && editData.head_resident_id) {
        const found = mapped.find(m => m.id === Number(editData.head_resident_id));
        if (found) {
          setEditData((prev) => ({
            ...prev,
            head_resident_code: found.resident_id || prev.head_resident_code || '',
            contactNumber: prev.contactNumber || found.contactNumber || '',
            email: prev.email || found.email || '',
          }));
        }
      }
    } catch (err) {
      console.warn('Could not fetch residents', err?.response?.data || err.message);
      setResidents([]);
    }
  };

  // fetch residents on mount so we can resolve head_resident_id to a display name
  useEffect(() => {
    fetchResidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when residents or households change, enrich households with resident info if missing
  useEffect(() => {
    if (!residents || residents.length === 0 || !recordsState || recordsState.length === 0) return;
    let updated = false;
    const enriched = recordsState.map(r => {
      if ((!r.name || r.name === '') && r.head_resident_id) {
        const found = residents.find(x => Number(x.id) === Number(r.head_resident_id));
        if (found) {
          updated = true;
          return {
            ...r,
            name: `${found.first_name || ''} ${found.last_name || ''}`.trim(),
            householdHead: `${found.first_name || ''} ${found.last_name || ''}`.trim(),
            contactNumber: r.contactNumber || found.contactNumber || '',
                email: r.email || found.email || '',
                age: r.age || found.age || '',
                civilStatus: r.civilStatus || found.civilStatus || '',
                gender: r.gender || found.gender || '',
          };
        }
      }
      return r;
    });
    if (updated) setRecordsState(enriched);
  }, [residents, recordsState]);

  const handleResidentSelect = (e) => {
    const val = e.target.value;
    if (!val) {
      // cleared selection
      setEditData({ ...editData, head_resident_id: null, name: '', contactNumber: '', email: '' });
      return;
    }
    const id = Number(val);
    const resident = residents.find(r => r.id === id);
    if (!resident) {
      setEditData({ ...editData, head_resident_id: id });
      return;
    }
    setEditData({
      ...editData,
      // FK used for backend associations
      head_resident_id: resident.id,
      // external resident id (human-readable) for display only
      head_resident_code: resident.resident_id || resident.residentId || '',
      name: `${resident.first_name} ${resident.last_name}`.trim(),
      contactNumber: resident.contactNumber || editData.contactNumber || '',
  email: resident.email || editData.email || '',
  age: resident.age || editData.age || '',
  civilStatus: resident.civilStatus || editData.civilStatus || '',
  gender: resident.gender || editData.gender || '',
    });
  };

  const handleSave = async () => {
    if (!isFormValid) return;
    setIsSaving(true);

    // If editData has an id -> update, otherwise create new
    if (editData.id) {
      try {
        const payload = {
          address: editData.address,
          members_count: editData.householdSize,
          head_resident_id: editData.head_resident_id || null,
          // include contact number using backend field name (mobilenumber)
          mobilenumber: editData.contactNumber || null,
        };
        const res = await api.put(`/admin/households/${editData.id}`, payload);
        const updated = res.data.household;
        setRecordsState((prev) => prev.map((r) => (r.id === updated.id ? {
          ...r,
          householdId: updated.household_no,
          address: updated.address,
          householdSize: updated.members_count,
          head_resident_id: updated.head_resident_id,
        } : r)));
        if (selectedRecord?.id === editData.id) setSelectedRecord((s) => ({ ...s, ...editData }));
      } catch (err) {
        console.warn('Failed to update household', err?.response?.data || err.message);
      }
    } else {
      try {
        const payload = {
          household_no: editData.householdId || `HH-${Date.now().toString().slice(-6)}`,
          address: editData.address || null,
          head_resident_id: editData.head_resident_id || null,
          members_count: editData.householdSize || 1,
          // include contact number using backend field name (mobilenumber)
          mobilenumber: editData.contactNumber || null,
        };
        const res = await api.post('/admin/households', payload);
        const created = res.data.household;
        const newRecord = {
          id: created.id,
          householdId: created.household_no,
          address: created.address,
          householdSize: created.members_count,
          head_resident_id: created.head_resident_id,
        };
        setRecordsState((prev) => [newRecord, ...prev]);
      } catch (err) {
        console.warn('Failed to create household', err?.response?.data || err.message);
      }
    }

    setIsSaving(false);
    setShowModal(false);
    setEditData({});
  };

  const getStatusCount = (status) => {
    return recordsState.filter((record) => record.documentType === status).length;
  };

  // derived stats from recordsState
  const totalHouseholds = recordsState.length;
  const totalMembers = recordsState.reduce((sum, r) => sum + (Number(r.householdSize) || 0), 0);

  // filter residents by search term (name, resident id, or household no)
  const filteredResidents = residents.filter((r) => {
    const q = residentSearch.trim().toLowerCase();
    if (!q) return true;
    const fullName = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
    const rid = (r.resident_id || '').toLowerCase();
    const hh = (r.household_no || '').toLowerCase();
    return fullName.includes(q) || rid.includes(q) || hh.includes(q);
  });

  return (
    <>
  <main className="p-6 md:ml-64 pt-20 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Household Records Management</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total Households"
              value={totalHouseholds}
              icon={<HomeIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
            />
            <StatCard
              label="Total Members"
              value={totalMembers}
              icon={<UserGroupIcon className="w-6 h-6 text-emerald-600" />}
              iconBg="bg-emerald-100"
            />
            <StatCard
              label="Brgy Clearance"
              value={getStatusCount('Brgy Clearance')}
              icon={<UserIcon className="w-6 h-6 text-blue-600" />}
              iconBg="bg-blue-100"
            />
          </div>
        </div>

        {/* Enhanced Search and Add Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex gap-3">
              <button onClick={handleCreateHousehold} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                <PlusIcon className="w-5 h-5" />
                Create Household
              </button>
            </div>

            <div className="flex gap-3 items-center w-full max-w-md">
              <div className="relative flex-grow">
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                  placeholder="Search by name, household ID, or document type..."
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

  {/* Enhanced Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <HomeIcon className="w-5 h-5" />
              Household Records
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Household ID</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Full Name</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Age</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Civil Status</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Gender</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <HomeIcon className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">No household records found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <React.Fragment key={record.id}>
                      <tr className="hover:bg-green-50 transition-all duration-200 group">
                        <td className="px-6 py-4">
                          <span className="font-mono text-green-600 bg-green-50 px-2 py-1 rounded text-xs">
                            {record.householdId}
                          </span>
                        </td>
                        <td
                          onClick={() => handleShowDetails(record)}
                          className="px-6 py-4 cursor-pointer group-hover:text-green-600 transition-colors duration-200"
                        >
                          <div className="font-semibold text-gray-900">
                            {record.name || '—'}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <EyeIcon className="w-3 h-3" />
                            Click to view details
                          </div>
                        </td>
                        
                        <td className="px-4 py-4">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {record.age ? `${record.age} years` : '—'}
                          </span>
                        </td>
            <td className="px-4 py-4 text-gray-700">{record.civilStatus || '—'}</td>
            <td className="px-4 py-4 text-gray-700">{record.gender || '—'}</td>
                        
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleShowDetails(record)}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                            >
                              <EyeIcon className="w-3 h-3" />
                              View
                            </button>
                            <button
                              onClick={() => handleEdit(record)}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                            >
                              <PencilIcon className="w-3 h-3" />
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>

                      {selectedRecord?.id === record.id && (
                        <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                          <td colSpan="6" className="px-8 py-8">
                            <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
                              <div className="flex flex-col lg:flex-row gap-8 items-start">
                                {/* Household Information Card */}
                                <div className="flex-1 space-y-6">
                                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                    <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                                      <HomeIcon className="w-5 h-5" /> Household Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div><span className="font-medium text-gray-700">Household ID:</span> <span className="text-gray-900">{selectedRecord.householdId || '—'}</span></div>
                                      <div><span className="font-medium text-gray-700">Household Size:</span> <span className="text-gray-900">{selectedRecord.householdSize ? `${selectedRecord.householdSize} members` : '—'}</span></div>
                                      <div><span className="font-medium text-gray-700">Household Head:</span> <span className="text-gray-900">{selectedRecord.householdHead || '—'}</span></div>
                                      <div><span className="font-medium text-gray-700">Address:</span> <span className="text-gray-900">{selectedRecord.address || '—'}</span></div>
                                    </div>
                                  </div>

                                  {/* Member Information Card */}
                                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                                    <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                      <UserIcon className="w-5 h-5" /> Member Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div><span className="font-medium text-gray-700">Full Name:</span> <span className="text-gray-900">{selectedRecord.name || '—'}</span></div>
                                      
                                      <div><span className="font-medium text-gray-700">Age:</span> <span className="text-gray-900">{selectedRecord.age ? `${selectedRecord.age} years` : '—'}</span></div>
                                      <div><span className="font-medium text-gray-700">Civil Status:</span> <span className="text-gray-900">{selectedRecord.civilStatus || '—'}</span></div>
                                      <div><span className="font-medium text-gray-700">Gender:</span> <span className="text-gray-900">{selectedRecord.gender || '—'}</span></div>
                                      <div><span className="font-medium text-gray-700">Contact Number:</span> <span className="text-gray-900">{selectedRecord.contactNumber || '—'}</span></div>
                                      <div><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-900">{selectedRecord.email || '—'}</span></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl shadow-2xl border border-green-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-3xl p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <PlusIcon className="w-6 h-6" />
                    {editData.id ? 'Edit Household Record' : 'Promote Resident to Household Head'}
                  </h2>
                  <button
                    onClick={() => { setShowModal(false); setEditData({}); }}
                    className="text-white hover:text-red-200 transition-colors duration-200"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Resident to Promote</label>
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={residentSearch}
                        onChange={(e) => setResidentSearch(e.target.value)}
                        placeholder="Search residents by name, id, or household..."
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      />
                      <select
                        value={editData.head_resident_id || ''}
                        onChange={handleResidentSelect}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      >
                        <option value="">Choose a resident (optional)</option>
                        {filteredResidents.map(r => (
                          <option key={r.id} value={r.id}>{`${r.first_name} ${r.last_name} ${r.household_no ? ` — ${r.household_no}` : ''}`}</option>
                        ))}
                      </select>
                    </div>

                    {editData.head_resident_id && (
                      <div className="mt-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Resident ID</label>
                        <input
                          type="text"
                          // show external resident code if available, otherwise fall back to FK id
                          value={editData.head_resident_code || editData.head_resident_id}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Household Size</label>
                    <input
                      type="number"
                      value={editData.householdSize || ''}
                      onChange={(e) => setEditData({ ...editData, householdSize: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter household size"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                    <input
                      type="text"
                      value={editData.contactNumber || ''}
                      onChange={(e) => setEditData({ ...editData, contactNumber: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter contact number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter email"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => { setShowModal(false); setEditData({}); }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!isFormValid || isSaving}
                    className={`px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${(!isFormValid || isSaving) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
  </main>
  </>
  );
};

export default HouseholdRecords;
