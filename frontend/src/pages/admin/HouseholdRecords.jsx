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

const StatCard = ({ label, value, icon, iconBg, gradient, delay = 0 }) => (
  <div 
    className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-slate-200/60 hover:shadow-3xl transition-all duration-700 hover:scale-105 hover:-translate-y-2 group relative overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 to-indigo-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div className="relative z-10 flex justify-between items-center">
      <div className="space-y-2">
        <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">{label}</p>
        <p className={`text-4xl font-black ${gradient} group-hover:scale-110 transition-all duration-500 drop-shadow-sm`}>
          {value}
        </p>
    </div>
      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative overflow-hidden ${iconBg}`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl"></div>
        <div className="relative z-10">
      {icon}
        </div>
      </div>
    </div>
    
    {/* Shimmer effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 3s ease-in-out infinite 0.5s; }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite 1s; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
        .animate-slide-in-up { animation: slideInUp 0.8s ease-out; }
        .animation-delay-500 { animation-delay: 0.5s; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 bg-gradient-to-br from-green-50 to-white min-h-screen p-6 pt-20">
            <div className="w-full max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center space-y-8 animate-fade-in relative mb-12">
          {/* Floating background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-xl animate-float"></div>
            <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-lg animate-float-delayed"></div>
            <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-md animate-float-slow"></div>
          </div>

          <div className="relative">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-3xl shadow-2xl mb-6 transform transition-all duration-700 hover:scale-110 hover:rotate-6 hover:shadow-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl group-hover:animate-spin"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <HomeIcon className="w-12 h-12 text-white relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <UserGroupIcon className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-7xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent tracking-tight animate-slide-in-up drop-shadow-lg">
              Household Records
            </h1>
            <div className="flex justify-center">
              <div className="w-32 h-1.5 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-full shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up animation-delay-500">
            <p className="text-slate-600 text-2xl leading-relaxed font-semibold">
              Comprehensive household management system for tracking family units and resident information
            </p>
            <p className="text-slate-500 text-lg leading-relaxed max-w-3xl mx-auto">
              Manage household records, track family members, and maintain accurate demographic data
            </p>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 justify-items-center">
          <StatCard
            label="Total Households"
            value={totalHouseholds}
            icon={<HomeIcon className="w-8 h-8 text-white drop-shadow-lg" />}
            iconBg="bg-gradient-to-br from-green-500 via-emerald-500 to-green-600"
            gradient="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent"
            delay={0}
          />
          <StatCard
            label="Total Members"
            value={totalMembers}
            icon={<UserGroupIcon className="w-8 h-8 text-white drop-shadow-lg" />}
            iconBg="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600"
            gradient="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 bg-clip-text text-transparent"
            delay={200}
          />
          <StatCard
            label="Brgy Clearance"
            value={getStatusCount('Brgy Clearance')}
            icon={<UserIcon className="w-8 h-8 text-white drop-shadow-lg" />}
            iconBg="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600"
            gradient="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent"
            delay={400}
          />
        </div>

        {/* Enhanced Search and Add Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/60 p-8 mb-12 relative overflow-hidden group mx-auto">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-center lg:justify-between items-center gap-6">
            <div className="flex gap-4 w-full lg:w-auto">
              <button 
                onClick={handleCreateHousehold} 
                className="group/btn bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 hover:shadow-3xl relative overflow-hidden whitespace-nowrap"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                <PlusIcon className="w-5 h-5 relative z-10 group-hover/btn:rotate-90 transition-transform duration-300" />
                <span className="relative z-10">Create Household</span>
              </button>
            </div>

            <div className="flex gap-4 items-center w-full lg:max-w-xl">
              <div className="relative flex-grow group/search">
                <input
                  type="text"
                  className="w-full pl-14 pr-6 py-4 border-2 border-slate-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 rounded-2xl text-base shadow-lg transition-all duration-500 bg-white/80 backdrop-blur-sm group-hover/search:shadow-xl group-hover/search:scale-105"
                  placeholder="Search by name, household ID, or document type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <MagnifyingGlassIcon className="w-6 h-6 absolute left-5 top-4 text-slate-400 group-hover/search:text-green-500 transition-colors duration-300" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover/search:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <button className="bg-gradient-to-r from-slate-600 via-gray-600 to-slate-700 hover:from-slate-700 hover:via-gray-700 hover:to-slate-800 text-white px-8 py-4 rounded-2xl text-base font-bold shadow-xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden group/filter">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/filter:opacity-100 transition-opacity duration-300"></div>
                <FunnelIcon className="w-5 h-5 relative z-10 group-hover/filter:rotate-180 transition-transform duration-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden relative group mx-auto">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white/30 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-8 py-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
            <h3 className="text-white font-bold text-2xl flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <HomeIcon className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
              Household Records
            </h3>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b-2 border-slate-200">
                <tr>
                  <th className="px-8 py-6 text-left font-bold text-slate-700 uppercase tracking-wider text-sm">Household ID</th>
                  <th className="px-8 py-6 text-left font-bold text-slate-700 uppercase tracking-wider text-sm">Full Name</th>
                  <th className="px-6 py-6 text-left font-bold text-slate-700 uppercase tracking-wider text-sm">Age</th>
                  <th className="px-6 py-6 text-left font-bold text-slate-700 uppercase tracking-wider text-sm">Civil Status</th>
                  <th className="px-6 py-6 text-left font-bold text-slate-700 uppercase tracking-wider text-sm">Gender</th>
                  <th className="px-6 py-6 text-left font-bold text-slate-700 uppercase tracking-wider text-sm">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200/60">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-6 animate-fade-in">
                        <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center shadow-lg">
                          <HomeIcon className="w-12 h-12 text-slate-400" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-slate-600 font-bold text-xl">No household records found</p>
                          <p className="text-slate-500 text-lg">Try adjusting your search criteria or create a new household</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record, index) => (
                    <React.Fragment key={record.id}>
                      <tr 
                        className="hover:bg-gradient-to-r hover:from-green-50/80 hover:to-emerald-50/80 transition-all duration-500 group relative"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="px-8 py-6">
                          <span className="font-mono text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-2xl text-sm font-bold shadow-md border border-green-200 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                            {record.householdId}
                          </span>
                        </td>
                        <td
                          onClick={() => handleShowDetails(record)}
                          className="px-8 py-6 cursor-pointer group-hover:text-green-700 transition-all duration-300"
                        >
                          <div className="font-bold text-slate-900 text-lg group-hover:scale-105 transition-transform duration-300">
                            {record.name || '—'}
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-2 mt-2 group-hover:text-green-600 transition-colors duration-300">
                            <EyeIcon className="w-4 h-4" />
                            Click to view details
                          </div>
                        </td>
                        
                        <td className="px-6 py-6">
                          <span className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-4 py-2 rounded-2xl text-sm font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
              {record.age ? `${record.age} years` : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-slate-700 font-semibold text-lg group-hover:text-green-700 transition-colors duration-300">
                            {record.civilStatus || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-slate-700 font-semibold text-lg group-hover:text-green-700 transition-colors duration-300">
                            {record.gender || '—'}
                          </span>
                        </td>
                        
                        <td className="px-6 py-6">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleShowDetails(record)}
                              className="group/btn bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl flex items-center gap-2 transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                              <EyeIcon className="w-4 h-4 relative z-10 group-hover/btn:scale-110 transition-transform duration-300" />
                              <span className="relative z-10">View</span>
                            </button>
                            <button
                              onClick={() => handleEdit(record)}
                              className="group/btn bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl flex items-center gap-2 transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                              <PencilIcon className="w-4 h-4 relative z-10 group-hover/btn:rotate-12 transition-transform duration-300" />
                              <span className="relative z-10">Edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {selectedRecord?.id === record.id && (
                        <tr className="bg-gradient-to-r from-green-50/90 to-emerald-50/90 backdrop-blur-sm">
                          <td colSpan="6" className="px-8 py-12">
                            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-green-200/60 relative overflow-hidden animate-fade-in-up">
                              {/* Animated background */}
                              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-teal-50/50"></div>
                              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full -translate-y-20 translate-x-20"></div>
                              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-200/20 to-indigo-200/20 rounded-full translate-y-16 -translate-x-16"></div>
                              
                              <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-start">
                                {/* Household Information Card */}
                                <div className="flex-1 space-y-8">
                                  <div className="bg-gradient-to-br from-green-100/80 to-emerald-100/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-green-200/60 shadow-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <h4 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-3 relative z-10">
                                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                                        <HomeIcon className="w-6 h-6 text-white" />
                                      </div>
                                      Household Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base relative z-10">
                                      <div className="space-y-1">
                                        <span className="font-bold text-slate-600 uppercase tracking-wider text-sm">Household ID</span>
                                        <div className="text-slate-900 font-mono text-lg bg-white/60 px-4 py-2 rounded-xl border border-green-200">{selectedRecord.householdId || '—'}</div>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="font-bold text-slate-600 uppercase tracking-wider text-sm">Household Size</span>
                                        <div className="text-slate-900 font-bold text-lg bg-white/60 px-4 py-2 rounded-xl border border-green-200">{selectedRecord.householdSize ? `${selectedRecord.householdSize} members` : '—'}</div>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="font-bold text-slate-600 uppercase tracking-wider text-sm">Household Head</span>
                                        <div className="text-slate-900 font-semibold text-lg bg-white/60 px-4 py-2 rounded-xl border border-green-200">{selectedRecord.householdHead || '—'}</div>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="font-bold text-slate-600 uppercase tracking-wider text-sm">Address</span>
                                        <div className="text-slate-900 font-semibold text-lg bg-white/60 px-4 py-2 rounded-xl border border-green-200">{selectedRecord.address || '—'}</div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Member Information Card */}
                                  <div className="bg-gradient-to-br from-blue-100/80 to-indigo-100/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-blue-200/60 shadow-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <h4 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-3 relative z-10">
                                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                                        <UserIcon className="w-6 h-6 text-white" />
                                      </div>
                                      Member Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base relative z-10">
                                      <div className="space-y-1">
                                        <span className="font-bold text-slate-600 uppercase tracking-wider text-sm">Full Name</span>
                                        <div className="text-slate-900 font-bold text-lg bg-white/60 px-4 py-2 rounded-xl border border-blue-200">{selectedRecord.name || '—'}</div>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="font-bold text-slate-600 uppercase tracking-wider text-sm">Age</span>
                                        <div className="text-slate-900 font-bold text-lg bg-white/60 px-4 py-2 rounded-xl border border-blue-200">{selectedRecord.age ? `${selectedRecord.age} years` : '—'}</div>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="font-bold text-slate-600 uppercase tracking-wider text-sm">Civil Status</span>
                                        <div className="text-slate-900 font-semibold text-lg bg-white/60 px-4 py-2 rounded-xl border border-blue-200">{selectedRecord.civilStatus || '—'}</div>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="font-bold text-slate-600 uppercase tracking-wider text-sm">Gender</span>
                                        <div className="text-slate-900 font-semibold text-lg bg-white/60 px-4 py-2 rounded-xl border border-blue-200">{selectedRecord.gender || '—'}</div>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="font-bold text-slate-600 uppercase tracking-wider text-sm">Contact Number</span>
                                        <div className="text-slate-900 font-semibold text-lg bg-white/60 px-4 py-2 rounded-xl border border-blue-200">{selectedRecord.contactNumber || '—'}</div>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="font-bold text-slate-600 uppercase tracking-wider text-sm">Email</span>
                                        <div className="text-slate-900 font-semibold text-lg bg-white/60 px-4 py-2 rounded-xl border border-blue-200">{selectedRecord.email || '—'}</div>
                                      </div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-gradient-to-br from-green-50/95 via-white/95 to-emerald-50/95 backdrop-blur-xl rounded-3xl shadow-3xl border border-green-200/60 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-slide-in-up">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 via-emerald-100/20 to-teal-100/30 rounded-3xl"></div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full -translate-y-24 translate-x-24"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-200/20 to-indigo-200/20 rounded-full translate-y-20 -translate-x-20"></div>
              
              <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-t-3xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
                <div className="flex justify-between items-center relative z-10">
                  <h2 className="text-3xl font-black text-white flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <PlusIcon className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                    {editData.id ? 'Edit Household Record' : 'Promote Resident to Household Head'}
                  </h2>
                  <button
                    onClick={() => { setShowModal(false); setEditData({}); }}
                    className="text-white hover:text-red-200 transition-all duration-300 transform hover:scale-110 hover:rotate-90 bg-white/10 hover:bg-red-500/20 rounded-2xl p-3 backdrop-blur-sm"
                  >
                    <XMarkIcon className="w-8 h-8 drop-shadow-lg" />
                  </button>
                </div>
              </div>

              <div className="p-10 space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                  <div>
                      <label className="block text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-green-600" />
                        Select Resident to Promote
                      </label>
                      <div className="space-y-4">
                        <div className="relative group">
                      <input
                        type="text"
                        value={residentSearch}
                        onChange={(e) => setResidentSearch(e.target.value)}
                        placeholder="Search residents by name, id, or household..."
                            className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl text-base focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-500 bg-white/80 backdrop-blur-sm group-hover:shadow-xl group-hover:scale-105"
                      />
                          <MagnifyingGlassIcon className="w-6 h-6 absolute right-4 top-4 text-slate-400 group-hover:text-green-500 transition-colors duration-300" />
                        </div>
                      <select
                        value={editData.head_resident_id || ''}
                        onChange={handleResidentSelect}
                          className="w-full px-6 py-4 border-2 border-slate-300 rounded-2xl text-base focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-500 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:scale-105"
                      >
                        <option value="">Choose a resident (optional)</option>
                        {filteredResidents.map(r => (
                          <option key={r.id} value={r.id}>{`${r.first_name} ${r.last_name} ${r.household_no ? ` — ${r.household_no}` : ''}`}</option>
                        ))}
                      </select>
                    </div>

                    {editData.head_resident_id && (
                        <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                          <label className="block text-lg font-bold text-slate-700 mb-3">Resident ID</label>
                        <input
                          type="text"
                          value={editData.head_resident_code || editData.head_resident_id}
                          readOnly
                            className="w-full px-6 py-4 border-2 border-green-200 rounded-2xl text-base bg-white/60 text-slate-700 cursor-not-allowed font-mono"
                        />
                      </div>
                    )}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                  <div>
                      <label className="block text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <HomeIcon className="w-5 h-5 text-emerald-600" />
                        Household Size
                      </label>
                    <input
                      type="number"
                      value={editData.householdSize || ''}
                      onChange={(e) => setEditData({ ...editData, householdSize: Number(e.target.value) })}
                        className="w-full px-6 py-4 border-2 border-slate-300 rounded-2xl text-base focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-500 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:scale-105"
                      placeholder="Enter household size"
                    />
                  </div>
                    
                  <div>
                      <label className="block text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <PhoneIcon className="w-5 h-5 text-blue-600" />
                        Contact Number
                      </label>
                    <input
                      type="text"
                      value={editData.contactNumber || ''}
                      onChange={(e) => setEditData({ ...editData, contactNumber: e.target.value })}
                        className="w-full px-6 py-4 border-2 border-slate-300 rounded-2xl text-base focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-500 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:scale-105"
                      placeholder="Enter contact number"
                    />
                  </div>
                    
                  <div>
                      <label className="block text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <EnvelopeIcon className="w-5 h-5 text-purple-600" />
                        Email
                      </label>
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full px-6 py-4 border-2 border-slate-300 rounded-2xl text-base focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-500 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:scale-105"
                      placeholder="Enter email"
                    />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-6 pt-8 border-t-2 border-slate-200">
                  <button
                    onClick={() => { setShowModal(false); setEditData({}); }}
                    className="px-8 py-4 text-slate-700 bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-105 hover:shadow-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!isFormValid || isSaving}
                    className={`px-8 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden group ${(!isFormValid || isSaving) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center gap-2">
                      {isSaving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
            </div>
          </main>
        </div>
      </div>
  </>
  );
};

export default HouseholdRecords;
