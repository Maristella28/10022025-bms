import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../utils/axiosConfig';
import { toast } from 'react-toastify';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = React.useRef(null);

  // Default permissions structure - all false initially
  const defaultPermissions = {
    dashboard: false,
    residents: false,
    documents: false,
    household: false,
    blotter: false,
    treasurer: false,
    officials: false,
    staff: false,
    communication: false,
    social_services: false,
    command_center: false,
    projects: false,
    inventory: false,
    logs: false
  };

  // Normalize permissions coming from backend (string/number/missing keys → booleans)
  const normalizePermissions = (raw) => {
    let parsed = raw;
    if (typeof raw === 'string') {
      try { parsed = JSON.parse(raw); } catch { parsed = {}; }
    }
    if (!parsed || typeof parsed !== 'object') parsed = {};
    return Object.keys(defaultPermissions).reduce((acc, key) => {
      const value = parsed[key];
      acc[key] = value === true || value === 1 || value === '1' || value === 'true';
      return acc;
    }, {});
  };

  // Map between UI keys and backend keys
  const uiToApiMap = {
    dashboard: 'dashboard',
    documents: 'documentsRecords',
    residents: 'residentsRecords',
    household: 'householdRecords',
    blotter: 'blotterRecords',
    treasurer: 'financialTracking',
    officials: 'barangayOfficials',
    staff: 'staffManagement',
    communication: 'communicationAnnouncement',
    projects: 'projectManagement',
    social_services: 'socialServices',
    command_center: 'disasterEmergency',
    inventory: 'inventoryAssets',
    logs: 'activityLogs'
  };

  const apiToUiMap = Object.entries(uiToApiMap).reduce((acc, [ui, api]) => {
    acc[api] = ui; return acc;
  }, {});

  // Convert backend permissions object to UI permission keys
  const mapApiToUiPermissions = (apiPerms) => {
    // Start with default permissions (all false)
    const base = { ...defaultPermissions };
    
    // Parse the source permissions if it's a string
    const source = typeof apiPerms === 'string' ? (()=>{try{return JSON.parse(apiPerms);}catch{return {};}})() : (apiPerms || {});
    
    // Map each backend permission to its UI equivalent
    Object.entries(source).forEach(([apiKey, value]) => {
      const normalizedValue = value === true || value === 1 || value === '1' || value === 'true';
      
      // Handle dashboard specially (it maps to itself)
      if (apiKey === 'dashboard') {
        base.dashboard = normalizedValue;
      } else {
        // Use the mapping for other keys
        const uiKey = apiToUiMap[apiKey];
        if (uiKey) {
          base[uiKey] = normalizedValue;
        }
      }
    });
    return base;
  };

  // Convert UI permission keys back to backend keys
  const mapUiToApiPermissions = (uiPerms) => {
    const out = {};
    
    Object.entries(uiPerms || {}).forEach(([uiKey, val]) => {
      const normalizedValue = !!val;
      
      // Handle dashboard specially (it maps to itself)
      if (uiKey === 'dashboard') {
        out.dashboard = normalizedValue;
      } else {
        // Use the mapping for other keys
        const apiKey = uiToApiMap[uiKey];
        if (apiKey) {
          out[apiKey] = normalizedValue;
        }
      }
    });
    return out;
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    selectedResident: '',
    searchQuery: '',
    department: '',
    contactNumber: '',
    address: '',
    birthdate: '',
    gender: '',
    civilStatus: '',
    position: '',
    permissions: {
      dashboard: true,
      residents: false,
      documents: false,
      household: false,
      blotter: false,
      treasurer: false,
      officials: false,
      staff: false,
      communication: false,
      social_services: false,
      command_center: false,
      projects: false,
      inventory: false,
      logs: false
    }
  });

  const [formErrors, setFormErrors] = useState({});

  const handleSearch = async (searchValue) => {
    if (!searchValue || searchValue.length < 1) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await axiosInstance.get(`/api/admin/residents/search?search=${searchValue}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching residents:', error);
      toast.error(
        error.response?.data?.message ||
        'Failed to search residents. Please try again.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'searchQuery') {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      searchTimeout.current = setTimeout(() => {
        handleSearch(value);
      }, 300);
    }
    
    if (name === 'position') {
      // Reset all module permissions first
      const resetPermissions = {
        dashboard: false, // No default access
        residents: false,
        documents: false,
        household: false,
        blotter: false,
        treasurer: false,
        officials: false,
        staff: false,
        communication: false,
        social_services: false,
        command_center: false,
        projects: false,
        inventory: false,
        logs: false
      };

      // Set specific permissions based on position
      switch (value) {
        case 'treasurer':
          // Treasurer specific permissions
          resetPermissions.dashboard = true;
          resetPermissions.treasurer = true;
          break;
        case 'command_center':
          // Command center specific permissions
          resetPermissions.dashboard = true;
          resetPermissions.command_center = true;
          resetPermissions.communication = true;
          break;
        case 'social_service':
          // Social service specific permissions
          resetPermissions.dashboard = true;
          resetPermissions.social_services = true;
          resetPermissions.residents = true;
          resetPermissions.documents = true;
          break;
        default:
          // Basic staff permissions
          resetPermissions.dashboard = true;
          resetPermissions.residents = true;
          resetPermissions.documents = true;
          resetPermissions.household = true;
          break;
      }

      setFormData(prevData => ({
        ...prevData,
        [name]: value,
        modulePermissions: resetPermissions
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }

    if (formErrors[name]) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/staff');
      
      if (response.data && Array.isArray(response.data)) {
        const mappedStaff = response.data.map(s => ({
          ...s,
          module_permissions: mapApiToUiPermissions(s.module_permissions)
        }));
        setStaff(mappedStaff);
      } else if (response.data && Array.isArray(response.data.staff)) {
        const mappedStaff = response.data.staff.map(s => ({
          ...s,
          module_permissions: mapApiToUiPermissions(s.module_permissions)
        }));
        setStaff(mappedStaff);
      } else {
        console.warn('Unexpected staff data format:', response.data);
        setStaff([]);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error(error.response?.data?.message || 'Failed to load staff list');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDeactivate = async (staffId) => {
    try {
      await axiosInstance.put(`/api/admin/staff/${staffId}/deactivate`);
      toast.success('Staff member deactivated successfully');
      fetchStaff();
    } catch (error) {
      console.error('Error deactivating staff:', error);
      toast.error(error.response?.data?.message || 'Failed to deactivate staff member');
    }
  };

  const handleUpdatePermissions = async () => {
    if (!editingStaff) return;

    try {
      // Map UI keys to backend keys for saving
      const currentPermissions = editingStaff.module_permissions || {};
      const formattedPermissions = mapUiToApiPermissions(currentPermissions);

      const response = await axiosInstance.put(`/api/admin/staff/${editingStaff.id}/permissions`, {
        module_permissions: formattedPermissions,
        staff_id: editingStaff.id
      });

      // Update the staff list with the new permissions (normalized booleans)
      setStaff(prevStaff => prevStaff.map(s => (
        s.id === editingStaff.id
          ? { ...s, module_permissions: mapApiToUiPermissions(formattedPermissions) }
          : s
      )));

      toast.success('Permissions updated successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });

      // Close the modal and refresh from server to ensure persistence
      setShowPermissionsModal(false);
      setEditingStaff(null);
      await fetchStaff();
    } catch (error) {
      console.error('Error updating permissions:', error);
      let errorMessage = 'An error occurred while updating permissions';
      
      if (error.response) {
        console.error('Error response:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });

        // Handle different types of error responses
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          const errors = Object.values(error.response.data.errors).flat();
          errorMessage = errors[0] || errorMessage;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.password || formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (!formData.department.trim()) errors.department = 'Department is required';
    if (!formData.position.trim()) errors.position = 'Position is required';
    if (!formData.contactNumber.trim()) errors.contactNumber = 'Contact number is required';
    else if (!/^\d{11}$/.test(formData.contactNumber)) errors.contactNumber = 'Contact number must be 11 digits';
    if (!formData.birthdate) errors.birthdate = 'Birth date is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.civilStatus) errors.civilStatus = 'Civil status is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await axiosInstance.post('/api/admin/staff', formData);
      toast.success('Staff account created successfully');
      setShowModal(false);
      fetchStaff();
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        selectedResident: '',
        searchQuery: '',
        department: '',
        contactNumber: '',
        position: '',
        birthdate: '',
        gender: '',
        civilStatus: '',
        address: '',
        modulePermissions: {
          dashboard: true,
          residents: false,
          staff: false,
          social_services: false,
          command_center: false,
          treasurer: false,
          reports: false,
          settings: false
        }
      });
    } catch (error) {
      console.error('Error creating staff account:', error);
      toast.error(error.response?.data?.message || 'Failed to create staff account');
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 lg:ml-64">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Staff Management</h1>
              <p className="text-gray-600">Manage staff accounts and permissions</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Staff Account
            </button>
          </div>
        </div>

        {/* Staff List */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-green-600 to-green-500">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Department</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Position</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No staff members found
                    </td>
                  </tr>
                ) : (
                  staff.map((member, index) => (
                    <tr 
                      key={member.id} 
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } transition-colors duration-150 hover:bg-green-50/60`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shadow-sm">
                              <span className="text-lg font-medium text-green-800">
                                {member.name[0].toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{member.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{member.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-medium rounded-full ${
                          member.active 
                            ? 'bg-green-100 text-green-700 ring-1 ring-green-700/10' 
                            : 'bg-red-100 text-red-700 ring-1 ring-red-700/10'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            member.active ? 'bg-green-600' : 'bg-red-600'
                          }`}></span>
                          {member.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => {
                            // Use the already-mapped permissions directly (no need to map again)
                            const initialPermissions = member.module_permissions || {};
                            
                            setEditingStaff({
                              ...member,
                              permissions: initialPermissions,
                              module_permissions: initialPermissions // Keep both in sync
                            });
                            setShowPermissionsModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 hover:text-green-800 transition-colors duration-150"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit Permissions
                        </button>
                        <button
                          onClick={() => handleDeactivate(member.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-150"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                          </svg>
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Permissions Modal */}
      {showPermissionsModal && editingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl transform transition-all">
            <div className="border-b border-gray-200">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Edit Module Permissions</h2>
                    <p className="mt-1 text-sm text-gray-500">Editing permissions for {editingStaff.name}</p>
                  </div>
                  <button
                    onClick={() => setShowPermissionsModal(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-full p-1"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="space-y-6">
                {/* Core Modules */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Core Modules</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['dashboard', 'residents', 'documents', 'household'].map(module => (
                      <div key={module} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`edit-module-${module}`}
                          checked={Boolean(editingStaff.module_permissions?.[module])}
                          onChange={(e) => {
                            setEditingStaff(prev => ({
                              ...prev,
                              module_permissions: {
                                ...(prev.module_permissions || {}),
                                [module]: e.target.checked
                              },
                              permissions: {
                                ...(prev.permissions || {}),
                                [module]: e.target.checked
                              }
                            }));
                          }}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`edit-module-${module}`} className="ml-2 text-sm text-gray-700 capitalize">
                          {module.replace(/_/g, ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Administrative Modules */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Administrative Modules</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['officials', 'staff', 'blotter', 'treasurer'].map(module => (
                      <div key={module} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`edit-module-${module}`}
                          checked={Boolean(editingStaff.module_permissions?.[module])}
                          onChange={(e) => {
                            setEditingStaff(prev => ({
                              ...prev,
                              module_permissions: {
                                ...(prev.module_permissions || {}),
                                [module]: e.target.checked
                              },
                              permissions: {
                                ...(prev.permissions || {}),
                                [module]: e.target.checked
                              }
                            }));
                          }}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`edit-module-${module}`} className="ml-2 text-sm text-gray-700 capitalize">
                          {module.replace(/_/g, ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Modules */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Service Modules</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['social_services', 'command_center', 'communication', 'projects'].map(module => (
                      <div key={module} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`edit-module-${module}`}
                          checked={Boolean(editingStaff.module_permissions?.[module])}
                          onChange={(e) => {
                            setEditingStaff(prev => ({
                              ...prev,
                              module_permissions: {
                                ...(prev.module_permissions || {}),
                                [module]: e.target.checked
                              },
                              permissions: {
                                ...(prev.permissions || {}),
                                [module]: e.target.checked
                              }
                            }));
                          }}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`edit-module-${module}`} className="ml-2 text-sm text-gray-700 capitalize">
                          {module.replace(/_/g, ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Modules */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">System Modules</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['inventory', 'logs'].map(module => (
                      <div key={module} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`edit-module-${module}`}
                          checked={Boolean(editingStaff.module_permissions?.[module])}
                          onChange={(e) => {
                            setEditingStaff(prev => ({
                              ...prev,
                              module_permissions: {
                                ...(prev.module_permissions || {}),
                                [module]: e.target.checked
                              },
                              permissions: {
                                ...(prev.permissions || {}),
                                [module]: e.target.checked
                              }
                            }));
                          }}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`edit-module-${module}`} className="ml-2 text-sm text-gray-700 capitalize">
                          {module.replace(/_/g, ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPermissionsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdatePermissions}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl transform transition-all overflow-hidden">
            {/* Modal Header */}
            <div className="border-b border-gray-200">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Create Staff Account</h2>
                    <p className="mt-1 text-sm text-gray-500">Add a new staff member to the system</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-full p-1"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Search Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-base font-medium text-gray-900 mb-3">Search Resident</h3>
                  <div className="relative">
                    <input
                      type="text"
                      name="searchQuery"
                      value={formData.searchQuery}
                      onChange={handleInputChange}
                      placeholder="Search resident by name or ID"
                      className="w-full rounded-lg border-gray-300 pl-4 pr-10 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {isSearching ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500" />
                      ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-2">
                      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200 max-h-48 overflow-y-auto">
                        {searchResults.map((resident) => (
                          <button
                            key={resident.id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                selectedResident: resident.id,
                                name: resident.name,
                                address: resident.address || '',
                                contactNumber: resident.contact_number || '',
                                gender: resident.gender || '',
                                birthdate: resident.birthdate || '',
                                civilStatus: resident.civil_status || ''
                              }));
                              setSearchResults([]);
                            }}
                            className="w-full px-4 py-3 flex items-center hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-lg font-medium text-green-800">
                                  {resident.name[0].toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4 flex-1">
                              <p className="text-sm font-medium text-gray-900">{resident.name}</p>
                              <p className="text-sm text-gray-500">{resident.resident_id}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-lg shadow-sm text-gray-900 sm:text-sm
                        ${formErrors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'}`}
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-lg shadow-sm text-gray-900 sm:text-sm
                        ${formErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'}`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-lg shadow-sm text-gray-900 sm:text-sm
                        ${formErrors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'}`}
                    />
                    {formErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-lg shadow-sm text-gray-900 sm:text-sm
                        ${formErrors.department ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'}`}
                    />
                    {formErrors.department && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.department}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-lg shadow-sm text-gray-900 sm:text-sm
                        ${formErrors.position ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'}`}
                    >
                      <option value="">Select Position</option>
                      <option value="treasurer">Treasurer</option>
                      <option value="command_center">Command Center</option>
                      <option value="social_service">Social Service</option>
                    </select>
                    {formErrors.position && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.position}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      placeholder="11-digit number"
                      className={`mt-1 block w-full rounded-lg shadow-sm text-gray-900 sm:text-sm
                        ${formErrors.contactNumber ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'}`}
                    />
                    {formErrors.contactNumber && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.contactNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                    <input
                      type="date"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-lg shadow-sm text-gray-900 sm:text-sm
                        ${formErrors.birthdate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'}`}
                    />
                    {formErrors.birthdate && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.birthdate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-lg shadow-sm text-gray-900 sm:text-sm
                        ${formErrors.gender ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'}`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {formErrors.gender && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.gender}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Civil Status</label>
                    <select
                      name="civilStatus"
                      value={formData.civilStatus}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-lg shadow-sm text-gray-900 sm:text-sm
                        ${formErrors.civilStatus ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'}`}
                    >
                      <option value="">Select Civil Status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                    {formErrors.civilStatus && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.civilStatus}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>

                {/* Module Permissions Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-base font-medium text-gray-900 mb-3">Module Access Permissions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(formData.permissions).map(([module, enabled]) => (
                      <div key={module} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`module-${module}`}
                          name={`permissions.${module}`}
                          checked={enabled}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              permissions: {
                                ...prev.permissions,
                                [module]: e.target.checked
                              }
                            }));
                          }}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`module-${module}`} className="ml-2 text-sm text-gray-700 capitalize">
                          {module.replace(/_/g, ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;