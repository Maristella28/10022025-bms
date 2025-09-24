import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import HeaderControls from "./components/HeaderControls";
import ResidentsTable from "./components/ResidentsTable";
import axiosInstance from "../../utils/axiosConfig";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  UserIcon,
  XMarkIcon,
  EyeIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
  DocumentTextIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  HeartIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  HeartIcon as HeartSolidIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  SparklesIcon,
  IdentificationIcon,
  ArrowPathIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ChartBarIcon
} from "@heroicons/react/24/solid";

// Utility Components
const Badge = ({ text, color, icon = null }) => (
  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${color} inline-flex items-center gap-1 shadow-sm transition-all duration-200 hover:shadow-md`}>
    {icon && icon}
    {text}
  </span>
);

// Working export functions - CSV and PDF (print-to-PDF)
function exportToCSV(data) {
  try {
    const items = Array.isArray(data) ? data : [];
    if (items.length === 0) {
      if (window.__showInfo) window.__showInfo('No data to export.', 'Export', 'info'); else alert('No data to export.');
      return;
    }

    const toName = (r) => {
      const first = r.first_name || '';
      const middle = r.middle_name ? ` ${r.middle_name}` : '';
      const last = r.last_name ? ` ${r.last_name}` : '';
      const suffix = r.name_suffix && r.name_suffix.toLowerCase() !== 'none' ? ` ${r.name_suffix}` : '';
      return `${first}${middle}${last}${suffix}`.trim();
    };

    const computeStatus = (r) => {
      if (r.update_status) return r.update_status;
      const dateStr = r.last_modified || r.updated_at;
      if (!dateStr) return 'Needs Verification';
      const updatedDate = new Date(dateStr);
      if (isNaN(updatedDate)) return 'Needs Verification';
      const now = new Date();
      const monthsDiff = (now.getFullYear() - updatedDate.getFullYear()) * 12 + (now.getMonth() - updatedDate.getMonth());
      if (monthsDiff <= 6) return 'Active';
      if (monthsDiff <= 12) return 'Outdated';
      return 'Needs Verification';
    };

    const escapeCSV = (val) => {
      const s = val == null ? '' : String(val);
      if (/[",\n\r]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const headers = ['Resident ID', 'Name', 'Update Status', 'Verification', 'Last Modified', 'For Review'];
    const rows = items.map((r) => [
      r.resident_id ?? r.id ?? '',
      toName(r),
      computeStatus(r),
      r.verification_status || 'Pending',
      r.last_modified ? new Date(r.last_modified).toLocaleString() : (r.updated_at ? new Date(r.updated_at).toLocaleString() : ''),
      r.for_review ? 'Yes' : 'No',
    ]);

    const csv = [headers, ...rows].map((row) => row.map(escapeCSV).join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'residents.csv';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('CSV export error:', e);
    if (window.__showInfo) window.__showInfo('Failed to export CSV.', 'Export Error', 'error'); else alert('Failed to export CSV.');
  }
}

function exportToPDF(data) {
  try {
    const items = Array.isArray(data) ? data : [];
    if (items.length === 0) {
      if (window.__showInfo) window.__showInfo('No data to export.', 'Export', 'info'); else alert('No data to export.');
      return;
    }

    const toName = (r) => {
      const first = r.first_name || '';
      const middle = r.middle_name ? ` ${r.middle_name}` : '';
      const last = r.last_name ? ` ${r.last_name}` : '';
      const suffix = r.name_suffix && r.name_suffix.toLowerCase() !== 'none' ? ` ${r.name_suffix}` : '';
      return `${first}${middle}${last}${suffix}`.trim();
    };

    const computeStatus = (r) => {
      if (r.update_status) return r.update_status;
      const dateStr = r.last_modified || r.updated_at;
      if (!dateStr) return 'Needs Verification';
      const updatedDate = new Date(dateStr);
      if (isNaN(updatedDate)) return 'Needs Verification';
      const now = new Date();
      const monthsDiff = (now.getFullYear() - updatedDate.getFullYear()) * 12 + (now.getMonth() - updatedDate.getMonth());
      if (monthsDiff <= 6) return 'Active';
      if (monthsDiff <= 12) return 'Outdated';
      return 'Needs Verification';
    };

    const rowsHtml = items.map((r) => `
      <tr>
        <td>${r.resident_id ?? r.id ?? ''}</td>
        <td>${toName(r)}</td>
        <td>${computeStatus(r)}</td>
        <td>${r.verification_status || 'Pending'}</td>
        <td>${r.last_modified ? new Date(r.last_modified).toLocaleString() : (r.updated_at ? new Date(r.updated_at).toLocaleString() : '')}</td>
        <td>${r.for_review ? 'Yes' : 'No'}</td>
      </tr>
    `).join('');

    const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Residents Report</title>
<style>
  body { font-family: Arial, sans-serif; padding: 24px; }
  h1 { font-size: 18px; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
  th { background: #f5f5f5; }
  @media print {
    @page { size: A4 landscape; margin: 12mm; }
  }
</style>
</head>
<body>
  <h1>Residents Report</h1>
  <table>
    <thead>
      <tr>
        <th>Resident ID</th>
        <th>Name</th>
        <th>Update Status</th>
        <th>Verification</th>
        <th>Last Modified</th>
        <th>For Review</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 300);
    };
  </script>
</body>
</html>
`;

    const win = window.open('', '_blank');
    if (!win) {
      if (window.__showInfo) window.__showInfo('Popup was blocked. Please allow popups to export to PDF.', 'Export PDF', 'error'); else alert('Popup was blocked. Please allow popups to export to PDF.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  } catch (e) {
    console.error('PDF export error:', e);
    if (window.__showInfo) window.__showInfo('Failed to export PDF.', 'Export Error', 'error'); else alert('Failed to export PDF.');
  }
}


const AvatarImg = ({ avatarPath }) => {
  const getAvatarUrl = (path) =>
    path && typeof path === 'string' && path.trim() !== '' && path.trim().toLowerCase() !== 'avatar' && path.trim().toLowerCase() !== 'avatars/'
      ? `http://localhost:8000/storage/${path}`
      : null;

  const avatarUrl = getAvatarUrl(avatarPath);
  const [imgSrc, setImgSrc] = useState(avatarUrl || '/default-avatar.png');

  useEffect(() => {
    setImgSrc(avatarUrl || '/default-avatar.png');
  }, [avatarUrl]);

  return (
    <img
      src={imgSrc}
      alt="avatar"
      className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-white"
      onError={() => setImgSrc('/default-avatar.png')}
    />
  );
};
// Main component wrapper
const ResidentsRecords = () => {
  console.log('ResidentsRecords component mounting');


  // Core state for residents
  const [residents, setResidents] = useState([]);
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Analytics and reporting state
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    update_status: '',
    verification_status: '',
    year: '',
    month: '',
    sort_by: 'last_modified',
    sort_order: 'desc'
  });
  const [reportData, setReportData] = useState([]);
  const [fetchingReports, setFetchingReports] = useState(false);

  // User management state
  const [residentsUsers, setResidentsUsers] = useState([]);
  const [residentsUsersLoading, setResidentsUsersLoading] = useState(false);
  const [recentlyDeletedResidents, setRecentlyDeletedResidents] = useState([]);
  const [recentlyDeletedLoading, setRecentlyDeletedLoading] = useState(false);
  const [showResidentsUsers, setShowResidentsUsers] = useState(false);
  const [showRecentlyDeleted, setShowRecentlyDeleted] = useState(false);

  // Modal and form state
  const [selectedResident, setSelectedResident] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editData, setEditData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [usersWithoutProfiles, setUsersWithoutProfiles] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Verification state
  const [comment, setComment] = useState('');
  const [currentResidentId, setCurrentResidentId] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  // Generic info modal state (replaces window.alert)
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModal, setInfoModal] = useState({ title: '', message: '', type: 'info' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const showInfo = (message, title = 'Notice', type = 'info') => {
    setInfoModal({ title, message: typeof message === 'string' ? message : JSON.stringify(message), type });
    setShowInfoModal(true);
  };

  const closeInfo = () => setShowInfoModal(false);

  const openConfirm = (residentId) => {
    setPendingDeleteId(residentId);
    setShowConfirmModal(true);
  };

  const closeConfirm = () => {
    setPendingDeleteId(null);
    setShowConfirmModal(false);
  };

  // Expose showInfo globally so module-level helpers (exportToCSV/PDF) can call it when component is mounted
  useEffect(() => {
    window.__showInfo = showInfo;
    return () => { delete window.__showInfo; };
  }, []);
  
  // Verification handling
  const handleVerification = async (residentId, status) => {
    try {
      const response = await fetch(`http://localhost:8000/api/residents/${residentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          status,
          comment: comment || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update verification status');
      }

      const result = await response.json();
      
      // Update the resident in the local state
      setResidents(prevResidents => 
        prevResidents.map(resident => 
          resident.id === residentId 
            ? { ...resident, verification_status: status }
            : resident
        )
      );

      // Show success message
      toast.success(result.message || 'Verification status updated successfully');
      
      // Close any open modals
      setShowCommentModal(false);
      setComment('');
      
      // Refresh the residents list to get updated data
      fetchResidents();
      
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast.error('Failed to update verification status');
    }
  };

  // Image modal state
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Derived filtering for the main table
  useEffect(() => {
    let list = Array.isArray(residents) ? residents.slice() : [];
    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      list = list.filter((r) => formatResidentName(r).toLowerCase().includes(q));
    }
    if (statusFilter && statusFilter !== '') {
      if (statusFilter === 'for_review') {
        list = list.filter((r) => !!r.for_review);
      } else if (statusFilter === 'active' || statusFilter === 'outdated' || statusFilter === 'needs_verification') {
        list = list.filter((r) => (r.update_status || getResidentStatus(r)).toLowerCase() === statusFilter);
      }
    }
    setFilteredResidents(list);
  }, [residents, search, statusFilter]);



  const handleFilterChange = (key, value) => {
    setReportFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      if (key === 'year') {
        newFilters.month = '';
      }
      return newFilters;
    });
  };

  const fetchReports = async () => {
    setFetchingReports(true);
    try {
      const res = await axiosInstance.get('/admin/residents/report', { params: reportFilters });
      setReportData(Array.isArray(res.data.residents) ? res.data.residents : []);
    } catch (err) {
      console.error('Failed to fetch reports', err);
      setReportData([]);
    } finally {
      setFetchingReports(false);
    }
  };

  const [selectedImageTitle, setSelectedImageTitle] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  // Toggle for showing/hiding report filters UI
  const [showReportFilters, setShowReportFilters] = useState(false);

  // Analytics state
  const [chartData, setChartData] = useState([]);
  const [selectedChartType, setSelectedChartType] = useState('registrations');
  const [selectedCategory, setSelectedCategory] = useState('gender');
  // Analytics filters for Registration Analytics
  const [selectedAnalyticsYear, setSelectedAnalyticsYear] = useState('');
  const [selectedAnalyticsMonth, setSelectedAnalyticsMonth] = useState(0); // 0 means no month selected

  // Verify resident user's residency
  const handleVerifyUser = async (profileId, userId) => {
    try {
      // First, approve the profile verification
      const response = await fetch(`http://localhost:8000/api/residents/verify/${profileId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'approved',
          notify: true // Enable notification to the resident
        })
      });

      if (!response.ok) {
        throw new Error('Failed to verify residency');
      }

      const result = await response.json();
      
      // Update both the profile and resident verification status
      const profileResponse = await fetch(`http://localhost:8000/api/profiles/${profileId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          verification_status: 'approved',
          profileId: profileId,
          userId: userId
        })
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to update profile status');
      }

      toast.success('Residency verification approved successfully. Resident can now complete their profile.');
      
      // Refresh both residents and users data
      await fetchResidentsUsers();
      await fetchResidents();

    } catch (error) {
      console.error('Error verifying residency:', error);
      toast.error('Failed to verify residency: ' + error.message);
    }
  };

  // Analytics computed data - memoized for performance
  const analyticsData = useMemo(() => ({
    gender: {
      male: residents.filter(r => r.sex?.toLowerCase() === 'male').length,
      female: residents.filter(r => r.sex?.toLowerCase() === 'female').length,
      other: residents.filter(r => r.sex && !['male','female'].includes(r.sex.toLowerCase())).length,
    },
    civil: {
      single: residents.filter(r => r.civil_status?.toLowerCase() === 'single').length,
      married: residents.filter(r => r.civil_status?.toLowerCase() === 'married').length,
      widowed: residents.filter(r => r.civil_status?.toLowerCase() === 'widowed').length,
      divorced: residents.filter(r => r.civil_status?.toLowerCase() === 'divorced').length,
      separated: residents.filter(r => r.civil_status?.toLowerCase() === 'separated').length,
    },
    age: {
      children: residents.filter(r => r.age < 13).length,
      teens: residents.filter(r => r.age >= 13 && r.age < 20).length,
      adults: residents.filter(r => r.age >= 20 && r.age < 60).length,
      seniors: residents.filter(r => r.age >= 60).length,
    },
    voter: {
      registered: residents.filter(r => r.voter_status?.toLowerCase() === 'registered').length,
      unregistered: residents.filter(r => r.voter_status?.toLowerCase() === 'unregistered').length,
      active: residents.filter(r => r.voter_status?.toLowerCase() === 'active').length,
      inactive: residents.filter(r => r.voter_status?.toLowerCase() === 'inactive').length,
    }
  }), [residents]);
  

  // Update filtered residents when search, residents, or statusFilter changes
  useEffect(() => {
    fetchResidents();
  }, []);

  // Update chart data when residents, year, or month changes
  useEffect(() => {
    if (residents.length > 0) {
      setChartData(generateChartData(residents, selectedAnalyticsYear, selectedAnalyticsMonth));
    }
  }, [residents, selectedAnalyticsYear, selectedAnalyticsMonth]);

  // Analytics options object
  const analyticsOptions = {
    gender: {
      key: 'gender',
      label: 'Gender',
      value: analyticsData.gender.male + analyticsData.gender.female + analyticsData.gender.other,
      icon: <UserIcon className="w-6 h-6 text-green-600" />,
      iconBg: 'bg-green-50',
      details: (
        <div className="pl-4 pt-2 text-sm space-y-1">
          <div>Male: <span className="font-bold">{analyticsData.gender.male}</span></div>
          <div>Female: <span className="font-bold">{analyticsData.gender.female}</span></div>
          <div>Other Gender: <span className="font-bold">{analyticsData.gender.other}</span></div>
        </div>
      )
    },
    civil: {
      key: 'civil',
      label: 'Civil Status',
      value: analyticsData.civil.single + analyticsData.civil.married + analyticsData.civil.widowed + analyticsData.civil.divorced + analyticsData.civil.separated,
      icon: <HeartIcon className="w-6 h-6 text-pink-600" />,
      iconBg: 'bg-pink-50',
      details: (
        <div className="pl-4 pt-2 text-sm space-y-1">
          <div>Single: <span className="font-bold">{analyticsData.civil.single}</span></div>
          <div>Married: <span className="font-bold">{analyticsData.civil.married}</span></div>
          <div>Widowed: <span className="font-bold">{analyticsData.civil.widowed}</span></div>
          <div>Divorced: <span className="font-bold">{analyticsData.civil.divorced}</span></div>
          <div>Separated: <span className="font-bold">{analyticsData.civil.separated}</span></div>
        </div>
      )
    },
    age: {
      key: 'age',
      label: 'Age Group',
      value: analyticsData.age.children + analyticsData.age.teens + analyticsData.age.adults + analyticsData.age.seniors,
      icon: <UserIcon className="w-6 h-6 text-blue-600" />,
      iconBg: 'bg-blue-50',
     details: (
       <div className="pl-4 pt-2 text-sm space-y-1">
         <div>Children (under 13): <span className="font-bold">{analyticsData.age.children}</span></div>
         <div>Teens (13-19): <span className="font-bold">{analyticsData.age.teens}</span></div>
         <div>Adults (20-59): <span className="font-bold">{analyticsData.age.adults}</span></div>
         <div>Seniors (60+): <span className="font-bold">{analyticsData.age.seniors}</span></div>
       </div>
     )
    },
  };

  useEffect(() => {
    fetchResidents();
  }, []);
  
  function renderAnalytics() {
    // Helper to get most common value for a field

    const summaryStats = [
      {
        label: 'Total Residents',
        value: residents.length,
        icon: <UserGroupIcon className="w-5 h-5 text-blue-600" />,
        iconBg: 'bg-blue-50',
      },
      {
        label: 'Active Voters',
        value: analyticsData.voter.active,
        icon: <CheckCircleIcon className="w-5 h-5 text-green-600" />,
        iconBg: 'bg-green-100',
      },
      {
        label: 'Inactive Voters',
        value: analyticsData.voter.inactive,
        icon: <XCircleIcon className="w-5 h-5 text-gray-500" />,
        iconBg: 'bg-gray-100',
      },
      {
        label: 'Adults',
        value: analyticsData.age.adults,
        icon: <UserIcon className="w-5 h-5 text-green-500" />,
        iconBg: 'bg-green-100',
      },
    ];

    // Table breakdowns for each category
    const breakdowns = {
      gender: [
        { label: 'Male', value: analyticsData.gender.male },
        { label: 'Female', value: analyticsData.gender.female },
        { label: 'Other Gender', value: analyticsData.gender.other },
      ],
      civil: [
        { label: 'Single', value: analyticsData.civil.single },
        { label: 'Married', value: analyticsData.civil.married },
        { label: 'Widowed', value: analyticsData.civil.widowed },
        { label: 'Divorced', value: analyticsData.civil.divorced },
        { label: 'Separated', value: analyticsData.civil.separated },
      ],
      age: [
        { label: 'Children (under 13)', value: analyticsData.age.children },
        { label: 'Teens (13-19)', value: analyticsData.age.teens },
        { label: 'Adults (20-59)', value: analyticsData.age.adults },
        { label: 'Seniors (60+)', value: analyticsData.age.seniors },
      ],
    };

    const categoryLabels = {
      gender: 'Gender',
      civil: 'Civil Status',
      age: 'Age Group',
    };

    return (
      <section className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
            <span className="inline-block"><UserGroupIcon className="w-7 h-7 text-blue-700" /></span>
            Residents Analytics
          </h2>
          <p className="text-gray-500 text-sm">A formal summary of resident demographics and key statistics.</p>
        </div>

        {/* Enhanced Summary Row with Advanced Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryStats.map((stat, index) => (
            <div
              key={stat.label}
              className="group bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 ${stat.iconBg} group-hover:shadow-xl`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 font-medium group-hover:text-gray-700 transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 group-hover:h-3 transition-all duration-300">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500 group-hover:from-green-600 group-hover:to-emerald-600"
                  style={{ width: `${Math.min((stat.value / residents.length) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Category Breakdown with Interactive Design */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-200 shadow-xl p-8 max-w-lg hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <ChartBarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">Category Breakdown</div>
                <div className="text-sm text-gray-600">Interactive demographic analysis</div>
              </div>
            </div>
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="gender">👥 Gender</option>
                <option value="civil">💍 Civil Status</option>
                <option value="age">🎂 Age Group</option>
              </select>
              <ChevronDownIcon className="w-5 h-5 absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{categoryLabels[selectedCategory]}</h3>
            <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
          </div>

          <div className="space-y-4">
            {breakdowns[selectedCategory].map((row, index) => {
              const percentage = residents.length > 0 ? (row.value / residents.length) * 100 : 0;
              return (
                <div
                  key={row.label}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-102 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{row.value}</span>
                      <span className="text-sm text-gray-500">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${percentage}%`,
                        animationDelay: `${index * 200}ms`
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Insights */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <GlobeAltIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Quick Insight</span>
            </div>
            <p className="text-sm text-blue-800">
              {selectedCategory === 'gender' && `${analyticsData.gender.female > analyticsData.gender.male ? 'More females' : 'More males'} in the community`}
              {selectedCategory === 'civil' && `${analyticsData.civil.married} married residents (${((analyticsData.civil.married / residents.length) * 100).toFixed(1)}% of total)`}
              {selectedCategory === 'age' && `${analyticsData.age.adults} adults in working age (${((analyticsData.age.adults / residents.length) * 100).toFixed(1)}% of total)`}
            </p>
          </div>
        </div>
      </section>
    );
  }

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showImageModal) {
        setShowImageModal(false);
        setSelectedImage(null);
        setSelectedImageTitle('');
        setImageLoading(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showImageModal]);

  const fetchResidents = async () => {
    try {
      const res = await axiosInstance.get("/admin/residents");
      const fetched = Array.isArray(res.data.residents) ? res.data.residents : [];
      // Attach computed update_status to each resident for consistent UI
      const withStatus = fetched.map((r) => ({ ...r, update_status: getResidentStatus(r) }));
      setResidents(withStatus);
      setChartData(generateChartData(withStatus, selectedAnalyticsYear, selectedAnalyticsMonth));
    } catch (err) {
      console.error("Error loading residents:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResidentsUsers = async () => {
    try {
      setResidentsUsersLoading(true);
      const res = await axiosInstance.get("/admin/residents-users");
      
      // Ensure we have valid data before updating state
      if (res.data && Array.isArray(res.data.users)) {
        console.log("Fetched residents users data:", res.data.users);
        
        // Map the data to ensure all required fields are present
        const processedUsers = res.data.users.map(user => ({
          ...user,
          profile: user.profile ? {
            ...user.profile,
            verification_status: user.profile.verification_status || 'pending'
          } : null
        }));
        
        setResidentsUsers(processedUsers);
      } else {
        console.error("Invalid data format received:", res.data);
        toast.error("Error loading residents data. Please try again.");
      }
    } catch (err) {
      console.error("Error loading residents users:", err);
      toast.error("Failed to load residents data. Please refresh the page.");
    } finally {
      setResidentsUsersLoading(false);
    }
  };

  const fetchRecentlyDeletedResidents = async () => {
    try {
      setRecentlyDeletedLoading(true);
      const res = await axiosInstance.get("/admin/residents-deleted");
      setRecentlyDeletedResidents(res.data.residents);
    } catch (err) {
      console.error("Error loading recently deleted residents:", err);
    } finally {
      setRecentlyDeletedLoading(false);
    }
  };

  const handleRestore = async (residentId) => {
    try {
      // Backend route is POST /residents/{id}/restore (protected by auth+admin middleware)
  await axiosInstance.post(`/residents/${residentId}/restore`);
  showInfo("Resident restored successfully.", 'Restore', 'success');
      // Refresh the lists and close the Recently Deleted view
      fetchRecentlyDeletedResidents();
      fetchResidents();
      setShowRecentlyDeleted(false);
    } catch (err) {
      console.error("Failed to restore resident:", err);
      showInfo("Failed to restore resident: " + (err?.response?.data?.message || err.message), 'Restore Error', 'error');
    }
  };

  const handleShowDetails = async (residentId) => {
    if (selectedResident?.id === residentId) {
      setSelectedResident(null);
      return;
    }

    setDetailLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/residents/${residentId}`);
      const resident = res.data.resident;
      
      // Check if residency verification is denied
      if (resident.verification_status === 'denied') {
        showInfo("This resident's residency verification has been denied. Details cannot be viewed.", 'Verification', 'info');
        setDetailLoading(false);
        return;
      }
      
      setSelectedResident(resident);
    } catch (err) {
      console.error("Failed to fetch resident", err);
      setSelectedResident(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdate = (resident) => {
    // Check if residency verification is denied
    if (resident.verification_status === 'denied') {
      showInfo("This resident's residency verification has been denied. Profile cannot be edited.", 'Verification', 'info');
      return;
    }
    
    setEditData({
      id: resident.id,
      user_id: resident.user_id,
      first_name: resident.first_name,
      middle_name: resident.middle_name || "",
      last_name: resident.last_name,
      name_suffix: resident.name_suffix || "",
      birth_date: resident.birth_date,
      birth_place: resident.birth_place,
      age: resident.age,
      nationality: resident.nationality || "",
      email: resident.email,
      mobile_number: resident.mobile_number,
      sex: resident.sex,
      civil_status: resident.civil_status,
      religion: resident.religion,
      current_address: resident.current_address,
      years_in_barangay: resident.years_in_barangay,
      voter_status: resident.voter_status,
      household_no: resident.household_no,
      avatar: null,

      housing_type: resident.housing_type || "",
      classified_sector: resident.classified_sector || "",
      educational_attainment: resident.educational_attainment || "",
      occupation_type: resident.occupation_type || "",
      business_name: resident.business_name || "",
      business_type: resident.business_type || "",
      business_address: resident.business_address || "",

      special_categories: resident.special_categories || [],
      head_of_family: resident.head_of_family === 1,
      business_outside_barangay: resident.business_outside_barangay === 1,

      vaccination_status: resident.vaccination_status || "",
      vaccine_received: resident.vaccine_received || [],
      year_vaccinated: resident.year_vaccinated || "",
      other_vaccine: resident.other_vaccine || "",
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "special_categories") {
      setEditData((prev) => {
        const prevCategories = prev.special_categories || [];
        return {
          ...prev,
          special_categories: checked
            ? [...prevCategories, value]
            : prevCategories.filter((item) => item !== value),
        };
      });
    } else if (type === "radio" && name === "vaccine_received") {
      setEditData((prev) => ({
        ...prev,
        vaccine_received: value === "None" ? ["None"] : [value],
      }));
    } else {
      setEditData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // ✅ Check profile existence before creation
  const checkIfProfileExists = async (userId) => {
    try {
      const res = await axiosInstance.get(`/admin/users/${userId}/has-profile`);
      return res.data.exists;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      if (Array.isArray(editData.vaccine_received)) {
        let vaccines = [...editData.vaccine_received];
        if (vaccines.includes("None")) {
          vaccines = ["None"];
        } else {
          vaccines = vaccines.filter((v) => v !== "None");
        }
        vaccines.forEach((v) => formData.append("vaccine_received[]", v));
      }
      // Ensure household_no is always present and not null/undefined
      const safeEditData = { ...editData, household_no: editData.household_no ?? "" };
      Object.entries(safeEditData).forEach(([key, value]) => {
        if (key === "vaccine_received" || key === "avatar") return;
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item !== null && item !== "") {
              formData.append(`${key}[]`, item);
            }
          });
        } else if (typeof value === "boolean") {
          formData.append(key, value ? "1" : "0");
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      if (editData.avatar && editData.avatar instanceof File) {
        formData.append('avatar', editData.avatar);
      }
      
      if (editData.id) {
        await axiosInstance.post(
          `/admin/residents/${editData.id}?_method=PUT`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else if (editData.user_id) {
        const alreadyExists = await checkIfProfileExists(editData.user_id);
        if (alreadyExists) {
          showInfo("❌ This user already has a resident profile.", 'Create Profile', 'error');
          return;
        }
        await axiosInstance.post(
          "/residents/complete-profile",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }
  showInfo("✅ Resident profile saved successfully.", 'Saved', 'success');
      setShowModal(false);
      fetchResidents();
    } catch (err) {
      // Enhanced error display for validation errors
      const errorMsg = err.response?.data?.message || err.message;
      let errorDetails = "No error details provided.";
      if (err.response?.data?.errors) {
        errorDetails = Object.entries(err.response.data.errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join('\n');
      } else if (err.response?.data?.error) {
        errorDetails = err.response.data.error;
      }
  console.error("❌ Save failed:", err.response?.data || err);
  showInfo(`❌ Failed to save resident.\n${errorMsg}\nDetails:\n${errorDetails}`, 'Save Error', 'error');
    }
  };

  const handleAddResidentClick = async () => {
    const users = await fetchUsersWithoutProfiles();
    if (users.length > 0) {
      setUsersWithoutProfiles(users);
      setSelectedUserId("");
      setShowSelectModal(true);
    } else {
      showInfo("✅ All users already have resident profiles.", 'Info', 'info');
    }
  };

  const fetchUsersWithoutProfiles = async () => {
    try {
      const res = await axiosInstance.get("/admin/users-without-profiles");
      return res.data.users;
    } catch (err) {
      console.error("Failed to fetch users without profiles:", err);
      return [];
    }
  };

  const handleApprove = async (residentId) => {
    if (!residentId) {
      toast.error('Invalid resident ID');
      return;
    }

    try {
      setResidentsUsersLoading(true);
      
      // Step 1: Call approval endpoint
      const response = await axiosInstance.post(`/admin/residents/${residentId}/approve-verification`);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to approve verification');
      }

      // Step 2: Update local state immediately
      setResidentsUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.profile?.id === residentId) {
            return {
              ...user,
              profile: {
                ...user.profile,
                verification_status: 'approved'
              }
            };
          }
          return user;
        })
      );
      
      // Step 3: Show success message
      toast.success('Verification approved successfully. Resident can now complete their profile.');
      
      // Step 4: Refresh all data
      await Promise.all([
        fetchResidents(),
        fetchResidentsUsers()
      ]);
    } catch (err) {
      console.error('Failed to approve:', err);
      toast.error(err.message || 'Failed to approve verification');
    } finally {
      setResidentsUsersLoading(false);
    }
  };

  const handleDeny = (residentId) => {
    setCurrentResidentId(residentId);
    setComment("");
    setShowCommentModal(true);
  };

  const handleDenySubmit = async () => {
    if (!comment.trim()) {
      showInfo("Please provide a reason for denial.", 'Validation', 'error');
      return;
    }

    try {
      await axiosInstance.post(`/admin/residents/${currentResidentId}/deny-verification`, {
        comment: comment
      });
  showInfo("Residency verification denied successfully.", 'Denied', 'success');
      setShowCommentModal(false);
      // Refresh both datasets so admin tables reflect changes
      fetchResidents();
      fetchResidentsUsers();
    } catch (err) {
  console.error("Failed to deny residency verification:", err);
  showInfo("Failed to deny residency verification.", 'Error', 'error');
    }
  };

  // Triggers the confirm modal
  const handleDelete = (residentId) => {
    openConfirm(residentId);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return closeConfirm();
    try {
      await axiosInstance.post(`/admin/residents/${pendingDeleteId}/delete`);
      showInfo('Resident deleted successfully.', 'Deleted', 'success');
      fetchResidents();
      fetchRecentlyDeletedResidents();
      setShowRecentlyDeleted(true);
    } catch (err) {
      console.error('Failed to delete resident:', err);
      showInfo(`Failed to delete resident: ${err.response?.data?.message || err.message || 'Unknown error'}`, 'Delete Error', 'error');
    } finally {
      closeConfirm();
    }
  };

  const handleConfirmSelection = async () => {
    if (!selectedUserId) {
      showInfo("❌ Please select a user.", 'Validation', 'error');
      return;
    }

    try {
      const res = await axiosInstance.get(`/user/${selectedUserId}`);
      const user = res.data.user;

      setEditData({
        user_id: user.id,
        first_name: "",
        middle_name: "",
        last_name: "",
        name_suffix: "",
        birth_date: "",
        birth_place: "",
        age: "",
        nationality: "",
        email: user.email || "",
        mobile_number: "",
        sex: "",
        civil_status: "",
        religion: "",
        current_address: "",
        years_in_barangay: "",
        voter_status: "",
        household_no: "",
        avatar: null,

        housing_type: "",
        classified_sector: "",
        educational_attainment: "",
        occupation_type: "",
        business_name: "",
        business_type: "",
        business_address: "",

        special_categories: [],
        head_of_family: false,
        business_outside_barangay: false,

        vaccination_status: "",
        vaccine_received: [],
        year_vaccinated: "",
        other_vaccine: "",
      });

      setShowSelectModal(false);
      setShowModal(true);
    } catch (err) {
      console.error("❌ Failed to load selected user:", err);
      showInfo("❌ Could not load user information.", 'Error', 'error');
    }
  };

  // Utility to check if avatar path is valid (not empty, not null, not just 'avatar' or 'avatars/')
  const isValidAvatarPath = (path) => {
    if (!path) return false;
    if (typeof path !== 'string') return false;
    if (path.trim() === '' || path.trim().toLowerCase() === 'avatar' || path.trim().toLowerCase() === 'avatars/') return false;
    return true;
  };

  // Returns the full URL for the avatar if valid, otherwise null
  const getAvatarUrl = (path) =>
    isValidAvatarPath(path) ? `http://localhost:8000/storage/${path}` : null;



  // Enhanced color functions for badges
  const getCivilStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'single':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'married':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'widowed':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'divorced':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'separated':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    }
  };

  const getGenderColor = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'female':
        return 'bg-pink-100 text-pink-800 border border-pink-200';
      default:
        return 'bg-purple-100 text-purple-800 border border-purple-200';
    }
  };

  const getVoterStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'registered':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'unregistered':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
    }
  };

  // Icon helper functions
  const getCivilStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'single':
        return <UserIcon className="w-3 h-3" />;
      case 'married':
        return <HeartSolidIcon className="w-3 h-3" />;
      case 'widowed':
        return <HeartIcon className="w-3 h-3" />;
      case 'divorced':
        return <XCircleIcon className="w-3 h-3" />;
      case 'separated':
        return <ExclamationTriangleIcon className="w-3 h-3" />;
      default:
        return <UserIcon className="w-3 h-3" />;
    }
  };

  const getGenderIcon = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return <UserIcon className="w-3 h-3" />;
      case 'female':
        return <HeartIcon className="w-3 h-3" />;
      default:
        return <UserGroupIcon className="w-3 h-3" />;
    }
  };

  const getVoterStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'registered':
        return <CheckCircleIcon className="w-3 h-3" />;
      case 'unregistered':
        return <XCircleIcon className="w-3 h-3" />;
      case 'pending':
        return <ClockIcon className="w-3 h-3" />;
      case 'active':
        return <CheckCircleIcon className="w-3 h-3" />;
      case 'inactive':
        return <XCircleIcon className="w-3 h-3" />;
      default:
        return <DocumentTextIcon className="w-3 h-3" />;
    }
  };

  // Utility function for formatting resident name
  function formatResidentName(resident) {
    if (!resident) return '';
    const { first_name, middle_name, last_name, name_suffix } = resident;
    return (
      first_name +
      (middle_name ? ` ${middle_name}` : '') +
      (last_name ? ` ${last_name}` : '') +
      (name_suffix && name_suffix.toLowerCase() !== 'none' ? ` ${name_suffix}` : '')
    );
  }

  function toDateInputValue(dateString) {
    if (!dateString) return "";
    // Handles both ISO and already-correct format
    const d = new Date(dateString);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 10);
  }
  

  // Utility to determine resident update status
  // Uses `last_modified` when available, falls back to `updated_at`.
  // Status rules:
  // - Active: updated within 6 months
  // - Outdated: updated within 7-12 months
  // - Needs Verification: older than 12 months or no date
  function getResidentStatus(resident) {
    if (!resident) return 'Needs Verification';
    const dateStr = resident.last_modified || resident.updated_at;
    if (!dateStr) return 'Needs Verification';
    const updatedDate = new Date(dateStr);
    if (isNaN(updatedDate)) return 'Needs Verification';
    const now = new Date();
    const monthsDiff = (now.getFullYear() - updatedDate.getFullYear()) * 12 + (now.getMonth() - updatedDate.getMonth());
    if (monthsDiff <= 6) return 'Active';
    if (monthsDiff <= 12) return 'Outdated';
    return 'Needs Verification';
  }

  // Generate chart data for monthly resident registrations
  const generateChartData = (residents, year = '', month = 0) => {
    const now = new Date();
    let data = [];

    if (year && month > 0) {
      // Daily data for selected month and year
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      const dailyData = {};
      residents.forEach(resident => {
        if (resident.created_at) {
          const date = new Date(resident.created_at);
          if (date >= monthStart && date <= monthEnd) {
            const dayKey = date.toISOString().split('T')[0];
            dailyData[dayKey] = (dailyData[dayKey] || 0) + 1;
          }
        }
      });
      // Fill all days of the month
      for (let day = 1; day <= monthEnd.getDate(); day++) {
        const date = new Date(year, month - 1, day);
        const key = date.toISOString().split('T')[0];
        data.push({
          month: date.getDate().toString(),
          registrations: dailyData[key] || 0
        });
      }
    } else if (year) {
      // Monthly data for selected year
      const yearlyData = {};
      residents.forEach(resident => {
        if (resident.created_at) {
          const date = new Date(resident.created_at);
          if (date.getFullYear() == year) {
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            yearlyData[monthKey] = (yearlyData[monthKey] || 0) + 1;
          }
        }
      });
      // Fill all months of the year
      for (let m = 0; m < 12; m++) {
        const date = new Date(year, m, 1);
        const key = `${year}-${String(m + 1).padStart(2, '0')}`;
        data.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          registrations: yearlyData[key] || 0
        });
      }
    } else {
      // Last 12 months
      const monthlyData = {};
      residents.forEach(resident => {
        if (resident.created_at) {
          const date = new Date(resident.created_at);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
        }
      });

      // Get last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        data.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          registrations: monthlyData[key] || 0
        });
      }
    }
    return data;
  };

  // Get most common demographic insights
  const getMostCommonDemographic = (residents, field, filterByMonth = false) => {
    const now = new Date();
    const filtered = filterByMonth ? residents.filter(resident => {
      if (!resident.created_at) return false;
      const date = new Date(resident.created_at);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }) : residents;

    const counts = {};
    filtered.forEach(resident => {
      const value = resident[field];
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    let max = 0;
    let most = '';
    for (const [value, count] of Object.entries(counts)) {
      if (count > max) {
        max = count;
        most = value;
      }
    }
    return { value: most, count: max };
  };

  // (status is attached on fetch as `update_status`; we compute locally as fallback)

  // UI controls for filter and sort
  const renderUIControls = () => {
    return (
  <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen ml-64 pt-36 px-6 pb-16 font-sans transition-all duration-300">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header with Advanced Animations */}
          <div className="text-center space-y-6 animate-fade-in">
            <div className="relative">
              <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-3xl shadow-2xl mb-6 transform transition-all duration-700 hover:scale-110 hover:rotate-6 hover:shadow-3xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-3xl animate-pulse opacity-60"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-3xl"></div>
                <UserIcon className="w-14 h-14 text-white relative z-10 drop-shadow-lg" />
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                <SparklesIcon className="w-5 h-5 text-white drop-shadow-sm" />
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-7xl font-black bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-800 bg-clip-text text-transparent tracking-tight animate-slide-in-up drop-shadow-lg">
                Residents Records
              </h1>
              <div className="flex justify-center">
                <div className="w-40 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 rounded-full shadow-lg animate-fade-in-up animation-delay-300"></div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up animation-delay-500">
              <p className="text-slate-700 text-2xl leading-relaxed font-semibold">
                Advanced Management System for Barangay Community
              </p>
              <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">
                Comprehensive resident profiles, real-time analytics, and intelligent reporting tools for efficient community governance and administration.
              </p>
            </div>

            {/* Enhanced Quick Stats Preview */}
            <div className="flex flex-wrap justify-center gap-6 mt-10 animate-fade-in-up animation-delay-700">
              <div className="group bg-white/90 backdrop-blur-md rounded-3xl px-8 py-5 shadow-xl border border-indigo-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-black text-slate-900 group-hover:text-indigo-700 transition-colors duration-300">{residents.length}</div>
                    <div className="text-sm text-slate-600 font-semibold">Total Residents</div>
                  </div>
                </div>
              </div>

              <div className="group bg-white/90 backdrop-blur-md rounded-3xl px-8 py-5 shadow-xl border border-emerald-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors duration-300">{analyticsData.voter.active}</div>
                    <div className="text-sm text-slate-600 font-semibold">Active Voters</div>
                  </div>
                </div>
              </div>

              <div className="group bg-white/90 backdrop-blur-md rounded-3xl px-8 py-5 shadow-xl border border-rose-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-black text-slate-900 group-hover:text-rose-700 transition-colors duration-300">{analyticsData.age.adults}</div>
                    <div className="text-sm text-slate-600 font-semibold">Adults</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <UserGroupIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Total</p>
                    <p className="text-4xl font-black text-slate-900 group-hover:text-indigo-700 transition-colors duration-300">{residents.length}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-700 group-hover:text-indigo-600 transition-colors duration-300">Residents</p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-1000 group-hover:from-indigo-600 group-hover:to-purple-700" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CheckCircleIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Active</p>
                    <p className="text-4xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors duration-300">{residents.filter(r => r.update_status === 'Active').length}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-700 group-hover:text-emerald-600 transition-colors duration-300">Records</p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all duration-1000 group-hover:from-emerald-600 group-hover:to-green-700" style={{ width: `${residents.length > 0 ? (residents.filter(r => r.update_status === 'Active').length / residents.length) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ExclamationTriangleIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Review</p>
                    <p className="text-4xl font-black text-slate-900 group-hover:text-amber-700 transition-colors duration-300">{residents.filter(r => r.for_review).length}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-700 group-hover:text-amber-600 transition-colors duration-300">Pending</p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all duration-1000 group-hover:from-amber-600 group-hover:to-orange-700" style={{ width: `${residents.length > 0 ? (residents.filter(r => r.for_review).length / residents.length) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheckIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Verified</p>
                    <p className="text-4xl font-black text-slate-900 group-hover:text-blue-700 transition-colors duration-300">{residents.filter(r => r.verification_status === 'approved').length}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-700 group-hover:text-blue-600 transition-colors duration-300">Profiles</p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full transition-all duration-1000 group-hover:from-blue-600 group-hover:to-cyan-700" style={{ width: `${residents.length > 0 ? (residents.filter(r => r.verification_status === 'approved').length / residents.length) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Analytics Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200 p-8 mb-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-indigo-50 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <ChartBarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Registration Analytics</h3>
                    <p className="text-slate-600 font-medium">Resident registration trends over the last 12 months</p>
                  </div>
                </div>
              </div>

              {/* Analytics Filters */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                  <select
                    value={selectedAnalyticsYear}
                    onChange={(e) => {
                      setSelectedAnalyticsYear(e.target.value);
                      setSelectedAnalyticsMonth(0);
                    }}
                    className="px-4 py-2 border-2 border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 rounded-xl text-sm font-medium bg-white shadow-sm"
                  >
                    <option value="">All Years (Last 12 Months)</option>
                    {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </select>
                  {selectedAnalyticsYear && (
                    <select
                      value={selectedAnalyticsMonth}
                      onChange={(e) => setSelectedAnalyticsMonth(parseInt(e.target.value))}
                      className="px-4 py-2 border-2 border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 rounded-xl text-sm font-medium bg-white shadow-sm"
                    >
                      <option value={0}>All Months</option>
                      {[
                        { value: 1, name: 'January' },
                        { value: 2, name: 'February' },
                        { value: 3, name: 'March' },
                        { value: 4, name: 'April' },
                        { value: 5, name: 'May' },
                        { value: 6, name: 'June' },
                        { value: 7, name: 'July' },
                        { value: 8, name: 'August' },
                        { value: 9, name: 'September' },
                        { value: 10, name: 'October' },
                        { value: 11, name: 'November' },
                        { value: 12, name: 'December' }
                      ].map(m => (
                        <option key={m.value} value={m.value}>{m.name}</option>
                      ))}
                    </select>
                  )}
                  {selectedAnalyticsYear && !selectedAnalyticsMonth && (
                    <div className="text-sm text-gray-500">Select a month for daily view</div>
                  )}
                </div>
              </div>
              
              <div className="bg-white/80 rounded-2xl p-6 shadow-lg border border-slate-100 mb-8">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} fontWeight="600" />
                    <YAxis stroke="#64748b" fontSize={12} fontWeight="600" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="registrations"
                      stroke="url(#colorGradient)"
                      strokeWidth={3}
                      dot={{ fill: '#6366f1', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, fill: '#4f46e5' }}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <p className="text-sm text-gray-500 mb-4 text-center">
                {selectedAnalyticsYear && selectedAnalyticsMonth > 0
                  ? `Daily registrations in ${new Date(selectedAnalyticsYear, selectedAnalyticsMonth - 1, 1).toLocaleString('default', { month: 'long' })} ${selectedAnalyticsYear}`
                  : selectedAnalyticsYear
                  ? `Monthly registrations in ${selectedAnalyticsYear}`
                  : 'Registrations over the last 12 months'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h4 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    Most Common Gender This Month
                  </h4>
                  <p className="text-2xl font-black text-emerald-900 mb-1">{getMostCommonDemographic(residents, 'sex', true).value || 'N/A'}</p>
                  <p className="text-sm text-emerald-700 font-semibold">{getMostCommonDemographic(residents, 'sex', true).count} residents registered</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h4 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <HeartIcon className="w-4 h-4 text-white" />
                    </div>
                    Most Common Civil Status
                  </h4>
                  <p className="text-2xl font-black text-blue-900 mb-1">{getMostCommonDemographic(residents, 'civil_status', false).value || 'N/A'}</p>
                  <p className="text-sm text-blue-700 font-semibold">{getMostCommonDemographic(residents, 'civil_status', false).count} residents overall</p>
                </div>
              </div>
            </div>
          </div>

          
          {/* Enhanced Search and Add Section */}
          <div className="relative bg-gradient-to-br from-white/90 via-slate-50/80 to-indigo-50/70 rounded-2xl shadow-xl border border-slate-200/50 p-6 mb-8 transition-all duration-500 hover:shadow-2xl backdrop-blur-md overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-indigo-200/20 to-purple-300/20 rounded-full -translate-y-30 translate-x-30 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-cyan-300/20 rounded-full translate-y-24 -translate-x-24 blur-2xl"></div>

            <div className="relative z-10">
              {/* Section Header */}
              <div className="text-center mb-6 animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl mb-4 transform transition-all duration-500 hover:scale-105 hover:rotate-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"></div>
                  <SparklesIcon className="w-8 h-8 text-white relative z-10 drop-shadow-lg" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-800 to-purple-800 bg-clip-text text-transparent mb-2">
                  Management Control Center
                </h2>
                <p className="text-slate-600 text-sm max-w-xl mx-auto font-medium">
                  Advanced tools for comprehensive resident management, real-time analytics, and streamlined administrative operations
                </p>
              </div>

              <div className="flex flex-col xl:flex-row justify-between items-center gap-6">
                {/* Enhanced Action Buttons Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full xl:w-auto">
                  <button
                    onClick={handleAddResidentClick}
                    className="group relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 hover:from-emerald-700 hover:via-green-700 hover:to-teal-800 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-sm font-bold transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-emerald-500/40 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-180 group-hover:scale-110 transition-all duration-500 shadow-lg">
                        <PlusIcon className="w-5 h-5 drop-shadow-sm" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-base">Add Resident</div>
                        <div className="text-xs text-emerald-100 font-medium">Create new profile</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => { if (!showAnalytics) fetchReports(); setShowAnalytics(!showAnalytics); }}
                    className="group relative bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 hover:from-indigo-700 hover:via-blue-700 hover:to-purple-800 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-sm font-bold transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-indigo-500/40 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                        <ChartBarIcon className="w-5 h-5 drop-shadow-sm" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-base">{showAnalytics ? "Hide" : "Show"} Analytics</div>
                        <div className="text-xs text-indigo-100 font-medium">Reports & insights</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowResidentsUsers(!showResidentsUsers);
                      if (!showResidentsUsers) {
                        fetchResidentsUsers();
                      }
                    }}
                    className="group relative bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-800 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-sm font-bold transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-violet-500/40 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-45 group-hover:scale-110 transition-all duration-500 shadow-lg">
                        <UserGroupIcon className="w-5 h-5 drop-shadow-sm" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-base">{showResidentsUsers ? 'View Residents' : 'User Accounts'}</div>
                        <div className="text-xs text-violet-100 font-medium">Manage users</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowRecentlyDeleted(!showRecentlyDeleted);
                      if (!showRecentlyDeleted) {
                        fetchRecentlyDeletedResidents();
                      }
                    }}
                    className="group relative bg-gradient-to-br from-rose-600 via-red-600 to-orange-700 hover:from-rose-700 hover:via-red-700 hover:to-orange-800 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-sm font-bold transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-rose-500/40 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:-rotate-45 group-hover:scale-110 transition-all duration-500 shadow-lg">
                        <TrashIcon className="w-5 h-5 drop-shadow-sm" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-base">Deleted Records</div>
                        <div className="text-xs text-rose-100 font-medium">Recovery center</div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Enhanced Search and Filter Section */}
                <div className="w-full xl:w-auto xl:min-w-[500px]">
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-200/50 transition-all duration-500 hover:shadow-2xl hover:bg-white/95 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <MagnifyingGlassIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">Search & Filter</h3>
                          <p className="text-slate-600 text-sm font-medium">Find and filter resident records</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Enhanced Search Input */}
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                          </div>
                          <input
                            type="text"
                            className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-2xl text-sm font-medium shadow-lg transition-all duration-300 focus:shadow-xl bg-white hover:shadow-md placeholder-slate-400 group-focus-within:placeholder-indigo-300"
                            placeholder="🔍 Search residents by name, ID, or any details..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                          {search && (
                            <button
                              onClick={() => setSearch('')}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-red-500 transition-all duration-300 z-10 hover:scale-110"
                            >
                              <div className="w-6 h-6 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors duration-300 shadow-md">
                                <XMarkIcon className="w-4 h-4" />
                              </div>
                            </button>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>

                        <div className="flex gap-3">
                          {/* Enhanced Status Filter */}
                          <div className="relative flex-1 group">
                            <select
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                              className="appearance-none w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 pr-10 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-lg hover:shadow-md transition-all duration-300 cursor-pointer group-focus-within:border-indigo-500"
                            >
                              <option value="">📊 All Status Types</option>
                              <option value="active">✅ Active Records</option>
                              <option value="outdated">⏰ Outdated Records</option>
                              <option value="needs_verification">🔍 Needs Verification</option>
                              <option value="for_review">👀 For Review</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <ChevronDownIcon className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </div>

                          {/* Enhanced Advanced Filter Button */}
                          <button className="group relative bg-gradient-to-br from-slate-600 via-gray-700 to-slate-800 hover:from-slate-700 hover:via-gray-800 hover:to-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-slate-500/40 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center gap-2">
                              <FunnelIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                              <span className="hidden sm:inline">Advanced</span>
                            </div>
                          </button>
                        </div>

                        {/* Enhanced Search Results Counter */}
                        {(search || statusFilter) && (
                          <div className="flex items-center justify-between text-sm bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl px-4 py-3 animate-fade-in border border-indigo-200 shadow-md">
                            <span className="flex items-center gap-2 font-semibold text-slate-700">
                              <CheckCircleIcon className="w-4 h-4 text-indigo-500" />
                              Found {filteredResidents.length} resident{filteredResidents.length !== 1 ? 's' : ''}
                            </span>
                            <button
                              onClick={() => {
                                setSearch('');
                                setStatusFilter('');
                              }}
                              className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors duration-300 hover:scale-105 transform"
                            >
                              Clear filters
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

            {/* Analytics Summary and Breakdown */}

          {/* Enhanced Reporting Section */}
          <div style={{display: showAnalytics ? 'block' : 'none'}}>
          {renderAnalytics()}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                  Resident Reports & Analytics
                </h3>
                <p className="text-gray-600 text-sm">Advanced reporting with filtering and sorting capabilities</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReportFilters(!showReportFilters)}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <FunnelIcon className="w-4 h-4" />
                  {showReportFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>
            </div>

            {/* Report Filters */}
            {showReportFilters && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FunnelIcon className="w-5 h-5 text-blue-600" />
                  Report Filters
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Update Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                    <select
                      value={reportFilters.update_status}
                      onChange={(e) => handleFilterChange('update_status', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active (Updated within 6 months)</option>
                      <option value="outdated">Outdated (6-12 months)</option>
                      <option value="needs_verification">Needs Verification</option>
                      <option value="for_review">For Review</option>
                    </select>
                  </div>

                  {/* Verification Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
                    <select
                      value={reportFilters.verification_status}
                      onChange={(e) => handleFilterChange('verification_status', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Verifications</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="denied">Denied</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <select
                      value={reportFilters.year}
                      onChange={(e) => handleFilterChange('year', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Years</option>
                      {Array.from({length: 11}, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year.toString()}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                    <select
                      value={reportFilters.month}
                      onChange={(e) => handleFilterChange('month', e.target.value)}
                      disabled={!reportFilters.year}
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!reportFilters.year ? 'border-gray-400 bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                    >
                      <option value="">All Months</option>
                      {reportFilters.year && Array.from({length: 12}, (_, i) => {
                        const monthNum = i + 1;
                        const monthName = new Date(parseInt(reportFilters.year), monthNum - 1, 1).toLocaleString('default', { month: 'long' });
                        return <option key={monthNum} value={monthNum.toString().padStart(2, '0')}>{monthName}</option>;
                      })}
                    </select>
                  </div>

                  {/* Sort By Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={reportFilters.sort_by}
                      onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="last_modified">Last Modified</option>
                      <option value="created_at">Created Date</option>
                      <option value="first_name">First Name</option>
                      <option value="last_name">Last Name</option>
                      <option value="verification_status">Verification Status</option>
                    </select>
                  </div>

                  {/* Sort Order Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                    <select
                      value={reportFilters.sort_order}
                      onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="desc">Descending (Newest First)</option>
                      <option value="asc">Ascending (Oldest First)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Report Statistics */}
            {reportData.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-blue-800">Report Summary</h4>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        console.log('Calling exportToCSV with data:', reportData);
                        exportToCSV(reportData);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => {
                        console.log('Calling exportToPDF with data:', reportData);
                        exportToPDF(reportData);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                      Export PDF
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">{reportData.length}</div>
                    <div className="text-sm text-gray-600">Total Residents</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-green-600">
                      {reportData.filter(r => r.update_status === 'Active').length}
                    </div>
                    <div className="text-sm text-gray-600">Active Residents</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-yellow-600">
                      {reportData.filter(r => r.update_status === 'Outdated').length}
                    </div>
                    <div className="text-sm text-gray-600">Outdated Records</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-red-600">
                      {reportData.filter(r => r.for_review).length}
                    </div>
                    <div className="text-sm text-gray-600">Needs Review</div>
                  </div>
                </div>

                {/* Report Chart */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h5 className="text-md font-semibold text-gray-800 mb-4">Status Distribution</h5>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: reportData.filter(r => r.update_status === 'Active').length, fill: '#10b981' },
                          { name: 'Outdated', value: reportData.filter(r => r.update_status === 'Outdated').length, fill: '#f59e0b' },
                          { name: 'Needs Verification', value: reportData.filter(r => r.update_status === 'Needs Verification').length, fill: '#ef4444' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Render Report Data */}
            {reportData.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Resident ID</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Update Status</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Verification</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Last Modified</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Review Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportData.map((resident) => (
                      <tr key={resident.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-blue-600">{resident.resident_id}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{formatResidentName(resident)}</td>
                        <td className="px-6 py-4">
                          {(() => {
                            const status = resident.update_status ?? getResidentStatus(resident) ?? 'Needs Verification';
                            const statusClass =
                              status === 'Active' ? 'bg-green-600 text-white' :
                              status === 'Outdated' ? 'bg-yellow-600 text-white' :
                              status === 'Needs Verification' ? 'bg-red-600 text-white' :
                              'bg-gray-600 text-white';
                            return (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                                {status}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            resident.verification_status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : resident.verification_status === 'denied'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {resident.verification_status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {resident.last_modified ? new Date(resident.last_modified).toLocaleString() : 'Never'}
                        </td>
                        <td className="px-6 py-4">
                          {resident.for_review ? (
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                              ⚠️ For Review
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Empty State */}
            {!fetchingReports && reportData.length === 0 && (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">No Report Data</h4>
                <p className="text-gray-500 text-sm">
                  {showReportFilters ? 'Try adjusting your filters or' : ''} 
                  Click "Generate Report" to view resident data
                </p>
              </div>
            )}
          </div>
          
          </div>
            
            {/* Residents Users Table */}
            {showResidentsUsers && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mt-8 transition-all duration-300 hover:shadow-2xl">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Residents Users
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Name</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Email</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Registration Date</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Resident ID</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Residency Verification</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Uploaded Image</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    
                    <tbody className="divide-y divide-gray-100">
                      {residentsUsersLoading ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-gray-500 font-medium">Loading residents users...</p>
                            </div>
                          </td>
                        </tr>
                      ) : residentsUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <UserIcon className="w-12 h-12 text-gray-300" />
                              <p className="text-gray-500 font-medium">No residents users found</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        residentsUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-blue-50 transition-all duration-200 border-b border-gray-100 hover:border-blue-200">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-900">{user.name}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-700">{user.email}</td>
                            <td className="px-6 py-4 text-gray-700">
                              {new Date(user.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                                {user.profile?.residents_id || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {user.profile?.verification_status === 'approved' ? (
                                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                                  <CheckIcon className="w-5 h-5" />
                                  <span className="font-medium">Verified</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
                                  <ClockIcon className="w-5 h-5" />
                                  <span className="font-medium">Pending</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col items-center gap-2">
                                {/* Verification Status */}
                                {user.profile?.verification_status === 'approved' ? (
                                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                    <CheckIcon className="w-4 h-4" />
                                    Verified
                                  </span>
                                ) : (
                                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                                    Pending
                                  </span>
                                )}
                                
                                {/* Image Preview */}
                                {user.profile?.residency_verification_image ? (
                                  <div className="relative group">
                                    <img
                                      src={`http://localhost:8000/storage/${user.profile.residency_verification_image}`}
                                      alt="Residency Verification"
                                      className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:scale-105 transition-transform duration-200 shadow-md"
                                      onClick={() => {
                                        setSelectedImage(`http://localhost:8000/storage/${user.profile.residency_verification_image}`);
                                        setSelectedImageTitle(`${user.name} - Residency Verification`);
                                        setImageLoading(true);
                                        setShowImageModal(true);
                                      }}
                                      onError={(e) => {
                                        console.error("Image failed to load:", user.profile.residency_verification_image);
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                      title={`Click to view ${user.name}'s residency verification image`}
                                    />
                                    <div className="hidden items-center justify-center w-16 h-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                                      <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                      <EyeIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                      View
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                                
                                {/* Status Badge */}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.profile?.verification_status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : user.profile?.verification_status === 'denied'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {user.profile?.verification_status || 'Pending'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 space-x-2">
                              {user.profile?.residency_verification_image ? (
                                <button
                                  onClick={() => {
                                    setSelectedImage(`http://localhost:8000/storage/${user.profile.residency_verification_image}`);
                                    setSelectedImageTitle(`${user.name} - Residency Verification`);
                                    setImageLoading(true);
                                    setShowImageModal(true);
                                  }}
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-1 rounded text-xs font-medium shadow-md flex items-center gap-1 transition-all duration-300 hover:shadow-lg"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                  View Document
                                </button>
                              ) : (
                                <span className="text-gray-400 text-xs italic">No image uploaded</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {user.profile?.verification_status !== 'approved' && (
                                  <button
                                    onClick={() => handleApprove(user.profile?.id)}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-1 rounded text-xs font-medium shadow-md flex items-center gap-1 transition-all duration-300 hover:shadow-lg"
                                  >
                                    <CheckIcon className="w-4 h-4" />
                                    Approve
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeny(user.profile?.id)}
                                  disabled={user.profile?.verification_status === 'denied'}
                                  className={`px-3 py-1 rounded text-xs font-medium ${
                                    user.profile?.verification_status === 'denied'
                                      ? 'bg-red-100 text-red-800 cursor-not-allowed'
                                      : 'bg-red-500 hover:bg-red-600 text-white'
                                  } transition-all duration-300 hover:shadow-md`}
                                >
                                  Deny
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
            )}
            
            {/* Recently Deleted Residents Table */}
            {showRecentlyDeleted && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mt-8 transition-all duration-300 hover:shadow-2xl">
                <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Recently Deleted Residents
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Profile</th>
                        <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Resident ID</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Name</th>
                        <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Age</th>
                        <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Nationality</th>
                        <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Status</th>
                        <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Gender</th>
                        <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Voter</th>
                        <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Voter's ID</th>
                        <th className="px-4 py-4 text-left font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    
                    <tbody className="divide-y divide-gray-100">
                      {recentlyDeletedLoading ? (
                        <tr>
                          <td colSpan="10" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-gray-500 font-medium">Loading recently deleted residents...</p>
                            </div>
                          </td>
                        </tr>
                      ) : recentlyDeletedResidents.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <UserIcon className="w-12 h-12 text-gray-300" />
                              <p className="text-gray-500 font-medium">No recently deleted residents found</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        recentlyDeletedResidents.map((r) => (
                          <tr key={r.id} className="hover:bg-red-50 transition-all duration-200 border-b border-gray-100 hover:border-red-200">
                            <td className="px-6 py-4"><AvatarImg avatarPath={r.avatar} /></td>
                            <td className="px-4 py-4">
                              <span className="font-mono text-red-600 bg-red-50 px-2 py-1 rounded text-xs">
                                {r.residents_id}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-900">
                                {formatResidentName(r)}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                                {r.age} years
                              </span>
                            </td>
                            <td className="px-4 py-4 text-gray-700">{r.nationality || "N/A"}</td>
                            <td className="px-4 py-4">
                              <Badge text={r.civil_status} color={getCivilStatusColor(r.civil_status)} icon={getCivilStatusIcon(r.civil_status)} />
                            </td>
                            <td className="px-4 py-4">
                              <Badge text={r.sex} color={getGenderColor(r.sex)} icon={getGenderIcon(r.sex)} />
                            </td>
                            <td className="px-4 py-4">
                              <Badge text={r.voter_status} color={getVoterStatusColor(r.voter_status)} icon={getVoterStatusIcon(r.voter_status)} />
                            </td>
                            <td className="px-4 py-4 text-gray-700">{r.voters_id_number || "N/A"}</td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => handleRestore(r.id)}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                              >
                                <SparklesIcon className="w-4 h-4" />
                                Restore
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {/* Enhanced Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Resident Records
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Profile</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Resident ID</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Name</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Age</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Nationality</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Civil Status</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Gender</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Voter</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Voter's ID</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-500 font-medium">Loading residents...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredResidents.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <UserIcon className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 font-medium">No residents found</p>
                          <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredResidents.map((r) => (

                      <React.Fragment key={r.id}>
                        <tr className="hover:bg-green-50 transition-all duration-200 group border-b border-gray-100 hover:border-green-200">
                          <td className="px-6 py-4"><AvatarImg avatarPath={r.avatar} /></td>
                          <td className="px-4 py-4">
                            <span className="font-mono text-green-600 bg-green-50 px-2 py-1 rounded text-xs">
                              {r.resident_id}
                            </span>
                          </td>
                          <td onClick={() => handleShowDetails(r.id)} className="px-6 py-4 cursor-pointer group-hover:text-green-600 transition-colors duration-200">
                            <div className="font-semibold text-gray-900">{formatResidentName(r)}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <EyeIcon className="w-3 h-3" /> Click to view details
                            </div>
                          </td>
                          <td className="px-4 py-4"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">{r.age} years</span></td>
                          <td className="px-4 py-4 text-gray-700">{r.nationality || "N/A"}</td>
                          <td className="px-4 py-4">
                            <Badge
                              text={r.civil_status}
                              color={getCivilStatusColor(r.civil_status)}
                              icon={getCivilStatusIcon(r.civil_status)}
                            />
                          </td>
                          <td className="px-4 py-4">
                            <Badge
                              text={r.sex}
                              color={getGenderColor(r.sex)}
                              icon={getGenderIcon(r.sex)}
                            />
                          </td>
                          <td className="px-4 py-4">
                            <Badge
                              text={r.voter_status}
                              color={getVoterStatusColor(r.voter_status)}
                              icon={getVoterStatusIcon(r.voter_status)}
                            />
                          </td>
                          <td className="px-4 py-4 text-gray-700">{r.voters_id_number || "N/A"}</td>
                          <td className="px-4 py-4">
                            {/* Update Status rendered below */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdate(r)}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                              >
                                <PencilIcon className="w-4 h-4" />
                                Edit
                              </button>
                              
                              {r.verification_status !== 'approved' && (
                                <button
                                  onClick={() => handleVerification(r.id, 'approved')}
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                >
                                  <CheckIcon className="w-4 h-4" />
                                  Verify
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(r.id)}
                                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                title="Delete Resident"
                              >
                                <TrashIcon className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>

                        {selectedResident?.id === r.id && (
                          <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <td colSpan="10" className="px-8 py-8">
                              {detailLoading ? (
                                <div className="flex justify-center py-8">
                                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              ) : (
                                <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200 transition-all duration-300 hover:shadow-xl">
                                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                                    {/* Enhanced Avatar Section */}
                                    <div className="flex-shrink-0">
                                      <div className="relative">
                                        <img
                                          src={getAvatarUrl(selectedResident.avatar)}
                                          alt="avatar"
                                          className="w-40 h-40 rounded-2xl object-cover shadow-xl border-4 border-white transition-transform duration-300 hover:scale-105"
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-3 cursor-pointer shadow-lg hover:scale-110 hover:bg-green-700 transition-all duration-200 flex items-center justify-center border-2 border-white">
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setEditData((prev) => ({ ...prev, avatar: e.target.files[0] }))}
                                            className="hidden"
                                          />
                                          <PencilIcon className="w-5 h-5" />
                                        </div>
                                      </div>
                                      <div className="mt-4 text-center">
                                        <h3 className="text-xl font-bold text-gray-900">
                                          {formatResidentName(selectedResident)}
                                        </h3>
                                        <p className="text-gray-600 text-sm">Resident ID: {selectedResident.resident_id}</p>
                                      </div>
                                    </div>

                                    {/* Enhanced Info Grid - All Details */}
                                    <div className="flex-1 space-y-6">
                                      {/* Personal Information Card */}
                                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-sm transition-all duration-300 hover:shadow-md">
                                        <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                                          <UserIcon className="w-5 h-5" /> Personal Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                          <div><span className="font-medium text-gray-700">First Name:</span> <span className="text-gray-900">{selectedResident.first_name}</span></div>
                                          <div><span className="font-medium text-gray-700">Middle Name:</span> <span className="text-gray-900">{selectedResident.middle_name || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Last Name:</span> <span className="text-gray-900">{selectedResident.last_name}</span></div>
                                          <div><span className="font-medium text-gray-700">Suffix:</span> <span className="text-gray-900">{selectedResident.name_suffix || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Birth Date:</span> <span className="text-gray-900">{toDateInputValue(selectedResident.birth_date)}</span></div>
                                          <div><span className="font-medium text-gray-700">Birth Place:</span> <span className="text-gray-900">{selectedResident.birth_place}</span></div>
                                          <div><span className="font-medium text-gray-700">Age:</span> <span className="text-gray-900">{selectedResident.age}</span></div>
                                          <div><span className="font-medium text-gray-700">Nationality:</span> <span className="text-gray-900">{selectedResident.nationality || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Religion:</span> <span className="text-gray-900">{selectedResident.religion || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-900">{selectedResident.email || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Mobile Number:</span> <span className="text-gray-900">{selectedResident.mobile_number || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Current Address:</span> <span className="text-gray-900">{selectedResident.current_address || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Years in Barangay:</span> <span className="text-gray-900">{selectedResident.years_in_barangay || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Household No:</span> <span className="text-gray-900">{selectedResident.household_no || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Relation to Head:</span> <span className="text-gray-900">{selectedResident.relation_to_head || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Housing Type:</span> <span className="text-gray-900">{selectedResident.housing_type || 'N/A'}</span></div>
                                        </div>
                                      </div>

                                      {/* Additional Information Card */}
                                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-sm transition-all duration-300 hover:shadow-md">
                                        <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                                          <AcademicCapIcon className="w-5 h-5" /> Additional Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                          <div><span className="font-medium text-gray-700">Sex:</span> <span className="text-gray-900">{selectedResident.sex}</span></div>
                                          <div><span className="font-medium text-gray-700">Civil Status:</span> <span className="text-gray-900">{selectedResident.civil_status}</span></div>
                                          <div><span className="font-medium text-gray-700">Voter Status:</span> <span className="text-gray-900">{selectedResident.voter_status}</span></div>
                                          <div><span className="font-medium text-gray-700">Educational Attainment:</span> <span className="text-gray-900">{selectedResident.educational_attainment || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Classified Sector:</span> <span className="text-gray-900">{selectedResident.classified_sector || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Occupation Type:</span> <span className="text-gray-900">{selectedResident.occupation_type || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Salary/Income:</span> <span className="text-gray-900">{selectedResident.salary_income || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Business Info:</span> <span className="text-gray-900">{selectedResident.business_info || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Voting Location:</span> <span className="text-gray-900">{selectedResident.voting_location || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Voter's ID Number:</span> <span className="text-gray-900">{selectedResident.voters_id_number || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Head of Family:</span> <span className="text-gray-900">{selectedResident.head_of_family ? 'Yes' : 'No'}</span></div>
                                          <div><span className="font-medium text-gray-700">Business Outside Barangay:</span> <span className="text-gray-900">{selectedResident.business_outside_barangay ? 'Yes' : 'No'}</span></div>
                                        </div>
                                      </div>

                                      {/* Business Information Card */}
                                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 shadow-sm transition-all duration-300 hover:shadow-md">
                                        <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                                          <BuildingOfficeIcon className="w-5 h-5" /> Business Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                          <div><span className="font-medium text-gray-700">Business Name:</span> <span className="text-gray-900">{selectedResident.business_name || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Business Type:</span> <span className="text-gray-900">{selectedResident.business_type || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Business Address:</span> <span className="text-gray-900">{selectedResident.business_address || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Business Location:</span> <span className="text-gray-900">{selectedResident.business_location || 'N/A'}</span></div>
                                        </div>
                                      </div>

                                      {/* Vaccination Information Card */}
                                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-sm transition-all duration-300 hover:shadow-md">
                                        <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                                          <HeartIcon className="w-5 h-5" /> Vaccination Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                          <div><span className="font-medium text-gray-700">Vaccination Status:</span> <span className="text-gray-900">{selectedResident.vaccination_status || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Year Vaccinated:</span> <span className="text-gray-900">{selectedResident.year_vaccinated || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Other Vaccine:</span> <span className="text-gray-900">{selectedResident.other_vaccine || 'N/A'}</span></div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-700">Vaccines Received:</span>
                                            <span className="text-gray-900">
                                              {selectedResident.vaccine_received && selectedResident.vaccine_received.length > 0
                                                ? selectedResident.vaccine_received.join(', ')
                                                : 'N/A'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Special Categories */}
                                      {selectedResident.special_categories?.length > 0 && (
                                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 shadow-sm transition-all duration-300 hover:shadow-md">
                                          <h4 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                                            <ShieldCheckIcon className="w-5 h-5" /> Special Categories
                                          </h4>
                                          <div className="flex flex-wrap gap-2">
                                            {selectedResident.special_categories.map((cat, index) => (
                                              <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105">
                                                {cat}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
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
        </div>

        {/* Enhanced Select User Modal */}
        {showSelectModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all animate-fade-in-up">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <UserIcon className="w-6 h-6" />
                    Select User
                  </h2>
                  <button
                    onClick={() => setShowSelectModal(false)}
                    className="text-white hover:text-red-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-blue-100 mt-2">Choose a user without a resident profile</p>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Available Users:
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <option value="">-- Select a user --</option>
                    {usersWithoutProfiles.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowSelectModal(false)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 hover:shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSelection}
                    disabled={!selectedUserId}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md transform hover:scale-105 ${
                      selectedUserId
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 focus:ring-green-300"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Proceed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generic Info Modal (replaces alert) */}
        {showInfoModal && (
          <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all animate-fade-in-up">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{infoModal.title}</h3>
                    <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{infoModal.message}</p>
                  </div>
                  <div className="flex items-start">
                    <button onClick={closeInfo} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={closeInfo} className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl">OK</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Modal for deletion */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-fade-in-up">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                    <p className="mt-2 text-sm text-gray-700">Are you sure you want to delete this resident? This action cannot be undone.</p>
                  </div>
                  <div className="flex items-start">
                    <button onClick={closeConfirm} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={closeConfirm} className="px-4 py-2 bg-gray-100 rounded-xl">Cancel</button>
                  <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl">Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comment Modal for Denying Verification */}
        {showCommentModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-fade-in-up">
              <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-t-2xl p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-6 h-6" />
                    Deny Residency Verification
                  </h2>
                  <button
                    onClick={() => setShowCommentModal(false)}
                    className="text-white hover:text-red-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-red-100 mt-2">Please provide a reason for denying this verification</p>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Reason for Denial:
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                    rows="4"
                    placeholder="Enter reason for denial..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowCommentModal(false)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 hover:shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDenySubmit}
                    className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50 hover:shadow-md"
                  >
                    Deny Verification
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl shadow-2xl border border-green-100 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
              {/* Sticky Modal Header with Stepper */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-3xl p-8 sticky top-0 z-10 flex flex-col gap-2 shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-3 tracking-tight drop-shadow-lg">
                    <PencilIcon className="w-7 h-7" />
                    {editData.user_id ? "Create Resident Profile" : "Edit Resident"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-red-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>
                {/* Stepper - Enhanced Green Theme */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="flex flex-col items-center">
                    <UserIcon className="w-6 h-6 text-white bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1 shadow-lg ring-2 ring-green-400 transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-green-100 mt-1">Personal</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-green-200 to-emerald-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <AcademicCapIcon className="w-6 h-6 text-white bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-green-100 mt-1">Additional</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-green-200 to-emerald-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <ShieldCheckIcon className="w-6 h-6 text-white bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-green-100 mt-1">Special</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-green-200 to-emerald-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <HeartIcon className="w-6 h-6 text-white bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-green-100 mt-1">Vaccine</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-green-200 to-emerald-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <UserIcon className="w-6 h-6 text-white bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-green-100 mt-1">Photo</span>
                  </div>
                </div>
              </div>

              <div className="p-10 space-y-10 bg-gradient-to-br from-white/80 to-green-50/80 rounded-b-3xl animate-fadeIn">
                {/* Avatar Preview */}
                <div className="flex justify-center mb-8 animate-fadeIn">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <img
                      src={editData.avatar ? URL.createObjectURL(editData.avatar) : (editData.avatar_url || "https://ui-avatars.com/api/?name=" + (editData.first_name || "R") + "+" + (editData.last_name || "P"))}
                      alt="avatar preview"
                      className="w-36 h-36 rounded-full object-cover border-4 border-emerald-400 shadow-xl bg-green-50 transition-all duration-300 hover:scale-105"
                    />
                    <label className="absolute bottom-2 right-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full p-3 cursor-pointer shadow-lg hover:scale-110 hover:bg-green-700 transition-all duration-200 flex items-center justify-center border-2 border-white">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditData((prev) => ({ ...prev, avatar: e.target.files[0] }))}
                        className="hidden"
                      />
                      <PencilIcon className="w-5 h-5" />
                    </label>
                  </div>
                </div>

                {/* Section Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Information Section */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-green-100 p-6 space-y-4 animate-fadeIn transition-all duration-300 hover:shadow-xl">
                    <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-2">
                      <UserIcon className="w-5 h-5" /> Personal Information
                    </h3>
                    {["first_name", "middle_name", "last_name", "name_suffix", "birth_date", "birth_place", "age", "nationality", "religion", "email", "mobile_number", "current_address", "years_in_barangay", "household_no", "relation_to_head", "housing_type"].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-green-700 mb-1 capitalize">
                          {field.replaceAll("_", " ")}
                        </label>
                        <input
                          type={field === "birth_date" ? "date" : "text"}
                          name={field}
                          value={field === "birth_date" ? toDateInputValue(editData[field]) : (editData[field] || "")}
                          onChange={handleInputChange}
                          className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-green-300 text-green-900 hover:shadow-md focus:shadow-lg"
                          placeholder={field.replaceAll("_", " ")}
                          required={field === "household_no"}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Additional Information Section */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-green-100 p-6 space-y-4 animate-fadeIn transition-all duration-300 hover:shadow-xl">
                    <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-2">
                      <AcademicCapIcon className="w-5 h-5" /> Additional Information
                    </h3>
                    {/* Sex */}
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">Sex</label>
                      <select
                        name="sex"
                        value={editData.sex || ""}
                        onChange={handleInputChange}
                        className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-green-900 hover:shadow-md focus:shadow-lg"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    {/* Civil Status */}
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">Civil Status</label>
                      <select
                        name="civil_status"
                        value={editData.civil_status || ""}
                        onChange={handleInputChange}
                        className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-green-900 hover:shadow-md focus:shadow-lg"
                      >
                        <option value="">Select</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                    </div>
                    {/* Voter Status */}
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">Voter Status</label>
                      <input
                        type="text"
                        name="voter_status"
                        value={editData.voter_status || ""}
                        onChange={handleInputChange}
                        className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-green-900 hover:shadow-md focus:shadow-lg"
                        placeholder="Voter Status"
                      />
                    </div>
                    {/* Work & Education */}
                    {["educational_attainment", "classified_sector", "occupation_type", "salary_income", "business_info", "business_type", "business_location", "voting_location", "voters_id_number", "year_vaccinated", "other_vaccine"].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-green-700 mb-1 capitalize">
                          {field.replaceAll("_", " ")}
                        </label>
                        <input
                          type="text"
                          name={field}
                          value={editData[field] || ""}
                          onChange={handleInputChange}
                          className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-green-900 hover:shadow-md focus:shadow-lg"
                          placeholder={field.replaceAll("_", " ")}
                        />
                      </div>
                    ))}
                    {/* Boolean Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Head of Family</label>
                        <select
                          name="head_of_family"
                          value={editData.head_of_family ? "1" : "0"}
                          onChange={handleInputChange}
                          className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-green-900 hover:shadow-md focus:shadow-lg"
                        >
                          <option value="0">No</option>
                          <option value="1">Yes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Business Outside Barangay</label>
                        <select
                          name="business_outside_barangay"
                          value={editData.business_outside_barangay ? "1" : "0"}
                          onChange={handleInputChange}
                          className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-green-900 hover:shadow-md focus:shadow-lg"
                        >
                          <option value="0">No</option>
                          <option value="1">Yes</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vaccination Information */}
                <div className="bg-white/90 rounded-2xl shadow-lg border border-green-100 p-6 animate-fadeIn transition-all duration-300 hover:shadow-xl">
                  <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-2">
                    <HeartIcon className="w-5 h-5" /> Vaccination Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["Pfizer-BioNTech", "Oxford-AstraZeneca", "Sputnik V", "Janssen", "Sinovac", "None"].map((vaccine) => (
                      <label key={vaccine} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors duration-200 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md">
                        <input
                          type="checkbox"
                          name="vaccine_received"
                          value={vaccine}
                          checked={editData.vaccine_received?.includes(vaccine)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setEditData((prev) => {
                              const current = prev.vaccine_received || [];
                              const updated = checked
                                ? [...current, vaccine]
                                : current.filter((v) => v !== vaccine);
                              return { ...prev, vaccine_received: updated };
                            });
                          }}
                          className="w-4 h-4 text-green-600 focus:ring-green-500 focus:ring-2 focus:ring-offset-1"
                        />
                        <span className="text-sm font-medium text-green-700">{vaccine}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Special Categories */}
                <div className="bg-white/90 rounded-2xl shadow-lg border border-green-100 p-6 animate-fadeIn transition-all duration-300 hover:shadow-xl">
                  <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-2">
                    <ShieldCheckIcon className="w-5 h-5" /> Special Categories
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["Solo Parent", "Solo Parent w/ ID", "Senior Citizen", "Senior Citizen w/ ID", "Senior Citizen w/ Pension", "Indigenous people", "4P's Member", "PWD", "PWD w/ ID"].map((cat) => (
                      <label key={cat} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors duration-200 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md">
                        <input
                          type="checkbox"
                          name="special_categories"
                          value={cat}
                          checked={editData.special_categories?.includes(cat) || false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setEditData((prev) => {
                              const prevCats = prev.special_categories || [];
                              const updated = checked
                                ? [...prevCats, cat]
                                : prevCats.filter((c) => c !== cat);
                              return { ...prev, special_categories: updated };
                            });
                          }}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 focus:ring-2 focus:ring-offset-1"
                        />
                        <span className="text-sm font-medium text-green-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-green-100 sticky bottom-0 bg-gradient-to-r from-green-50 to-emerald-50 z-10 rounded-b-3xl animate-fadeIn">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-700 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Saving...</span>
                    ) : (
                      <><CheckCircleIcon className="w-5 h-5" /> Save Changes</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

                 {/* Image Modal */}
                 {showImageModal && selectedImage && (
           <div
             className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm"
             onClick={() => {
               setShowImageModal(false);
               setSelectedImage(null);
               setSelectedImageTitle('');
               setImageLoading(false);
             }}
           >
             <div
               className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative animate-fade-in-up"
               onClick={(e) => e.stopPropagation()}
             >
               <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
                 <h3 className="text-xl font-bold text-gray-900">{selectedImageTitle}</h3>
                 <div className="flex items-center gap-3">
                   <button
                     onClick={() => window.open(selectedImage, '_blank')}
                     className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                   >
                     <EyeIcon className="w-4 h-4" />
                     Open in New Tab
                   </button>
                   <button
                     onClick={() => {
                       setShowImageModal(false);
                       setSelectedImage(null);
                       setSelectedImageTitle('');
                       setImageLoading(false);
                     }}
                     className="text-gray-600 hover:text-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 rounded-full p-1"
                   >
                     <XMarkIcon className="w-6 h-6" />
                   </button>
                 </div>
               </div>
               <div className="p-6">
                 <div className="relative">
                   {imageLoading && (
                     <div className="flex items-center justify-center w-full h-64">
                       <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                     </div>
                   )}
                   <img
                     src={selectedImage}
                     alt={selectedImageTitle}
                     className={`w-full h-auto max-h-[70vh] object-contain mx-auto rounded-lg shadow-lg transition-all duration-300 ${imageLoading ? 'hidden' : ''}`}
                     onLoad={() => setImageLoading(false)}
                     onError={(e) => {
                       console.error("Image failed to load:", selectedImage);
                       setImageLoading(false);
                       e.target.style.display = 'none';
                       e.target.nextSibling.style.display = 'flex';
                     }}
                   />
                   <div className="hidden items-center justify-center w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 transition-all duration-300">
                     <div className="text-center">
                       <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                       <p className="text-gray-500 font-medium">Image failed to load</p>
                       <p className="text-gray-400 text-sm">The image may have been deleted or moved</p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         )}
      </main>
    </>
  );
  };

  return renderUIControls();
};

export default ResidentsRecords;