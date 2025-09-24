import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, HomeIcon, PlusIcon } from '@heroicons/react/24/solid';
import api from '../../../../utils/axiosConfig';

const CreateHousehold = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [householdSize, setHouseholdSize] = useState(1);
  const [headResidentId, setHeadResidentId] = useState('');
  const [residents, setResidents] = useState([]);
  const [headResidentCode, setHeadResidentCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [civilStatus, setCivilStatus] = useState('');
  const [gender, setGender] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchResidents = async () => {
      try {
        const res = await api.get('/admin/residents');
        if (!mounted) return;
        const list = res.data?.data ? res.data.data : (Array.isArray(res.data) ? res.data : (res.data.residents || []));
        const mapped = list.map(r => ({
          id: r.id,
          resident_id: r.resident_id || r.residentId || r.resident_no || '',
          first_name: r.first_name || r.firstName || r.name || '',
          last_name: r.last_name || r.lastName || '',
          contactNumber: r.mobilenumber || r.mobile_number || r.contact_number || r.phone || '',
          email: r.email || r.contactEmail || '',
          age: r.age || r.years_old || (r.profile && r.profile.age) || '',
          civilStatus: r.civil_status || r.civilStatus || (r.profile && r.profile.civil_status) || '',
          gender: r.gender || r.sex || (r.profile && r.profile.gender) || '',
        }));
        setResidents(mapped);
      } catch (err) {
        console.warn('Could not fetch residents', err?.response?.data || err?.message);
        setResidents([]);
      }
    };
    fetchResidents();
    return () => { mounted = false; };
  }, []);

  const isValid = () => {
    if (!householdSize || Number(householdSize) <= 0) return false;
    // head resident is required
    if (!headResidentId) return false;
    return true;
  };

  // trim members if householdSize decreased below current members length
  useEffect(() => {
    const size = Number(householdSize) || 0;
    if (members.length > size) {
      setMembers((prev) => prev.slice(0, size));
      setError(`Household size reduced to ${size}; trimmed members to fit`);
    }
  }, [householdSize]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!isValid()) return setError('Please complete required fields.');
    setError(null);
    setIsSaving(true);
    try {
      const payload = {
        household_no: `HH-${Date.now().toString().slice(-6)}`,
        address: address || null,
        head_resident_id: headResidentId || null,
          head_resident_code: headResidentCode || null,
          head_full_name: fullName || null,
  members_count: Number(householdSize) || 1,
  // members: array of resident ids
  members: members.map(m => m.id),
  members_full: members.map(m => ({ id: m.id, resident_id: m.resident_id, name: m.name, contactNumber: m.contactNumber, email: m.email, age: m.age, civilStatus: m.civilStatus, gender: m.gender })),
        mobilenumber: contactNumber || null,
        email: email || null,
          age: age || null,
          civil_status: civilStatus || null,
          gender: gender || null,
      };
      const res = await api.post('/admin/households', payload);
      // optimistic navigation back to households list
      navigate('/admin/households');
    } catch (err) {
      console.warn('Failed to create household', err?.response?.data || err?.message);
      setError(err?.response?.data?.message || 'Failed to create household');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="p-6 md:ml-64 pt-20 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4 text-gray-700" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><HomeIcon className="w-5 h-5 text-green-600"/> Create Household</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Promote Resident (required)</label>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Search residents by name or id..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                />
                <select
                  value={headResidentId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHeadResidentId(val);
                    if (!val) {
                      // clear autofill
                      setHeadResidentCode('');
                      setFullName('');
                      setContactNumber('');
                      setEmail('');
                      setAge('');
                      setCivilStatus('');
                      setGender('');
                      return;
                    }
                    const resident = residents.find(rr => String(rr.id) === String(val));
                    if (resident) {
                      setHeadResidentCode(resident.resident_id || '');
                      setFullName(`${resident.first_name || ''} ${resident.last_name || ''}`.trim());
                      setContactNumber(resident.contactNumber || '');
                      setEmail(resident.email || '');
                      setAge(resident.age || '');
                      setCivilStatus(resident.civilStatus || '');
                      setGender(resident.gender || '');
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                >
                  <option value="">Choose resident</option>
                  {residents
                    .filter(r => {
                      const q = memberSearch.trim().toLowerCase();
                      if (!q) return true;
                      const full = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
                      return full.includes(q) || (r.resident_id || '').toLowerCase().includes(q);
                    })
                    .map(r => (
                      <option key={r.id} value={r.id}>{`${r.first_name} ${r.last_name} ${r.resident_id ? ` — ${r.resident_id}` : ''}`}</option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Household Size</label>
              <input
                type="number"
                min={1}
                value={householdSize}
                onChange={(e) => setHouseholdSize(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House number, street, barangay"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
              />
            </div>

            

            {/* Resident summary / autofill fields */}
            {headResidentId && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Resident ID</label>
                  <input type="text" value={headResidentCode || headResidentId} readOnly className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-100 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                  <input type="number" min={0} value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Civil Status</label>
                  <select value={civilStatus} onChange={(e) => setCivilStatus(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm">
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Members management */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Members</label>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Search residents to add..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm w-full"
                  />
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-sm w-full"
                  >
                    <option value="">Select resident</option>
                    {residents
                      .filter(r => {
                        // exclude head and existing members
                        if (String(r.id) === String(headResidentId)) return false;
                        if (members.find(m => String(m.id) === String(r.id))) return false;
                        const q = memberSearch.trim().toLowerCase();
                        if (!q) return true;
                        const full = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
                        return full.includes(q) || (r.resident_id || '').toLowerCase().includes(q);
                      })
                      .map(r => (
                        <option key={r.id} value={r.id}>{`${r.first_name} ${r.last_name} ${r.resident_id ? ` — ${r.resident_id}` : ''}`}</option>
                      ))}
                  </select>
                  <div className="flex md:justify-start justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        const size = Number(householdSize) || 0;
                        if (!selectedMemberId) return setError('Select a resident to add');
                        if (members.length >= size) return setError(`Household size limit reached (${size})`);
                        const resident = residents.find(r => String(r.id) === String(selectedMemberId));
                        if (!resident) return setError('Selected resident not found');
                        setMembers(prev => [...prev, {
                          id: resident.id,
                          resident_id: resident.resident_id,
                          name: `${resident.first_name || ''} ${resident.middle_name ? resident.middle_name + ' ' : ''}${resident.last_name || ''}${resident.name_suffix ? ' ' + resident.name_suffix : ''}`.trim(),
                          contactNumber: resident.mobile_number || resident.contact_number || '',
                          email: resident.email || '',
                          age: resident.age || '',
                          civilStatus: resident.civil_status || '',
                          gender: resident.sex || '',
                        }]);
                        setSelectedMemberId('');
                        setError(null);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl w-full md:w-auto"
                    >
                      Add Member
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {members.length === 0 ? (
                    <div className="text-sm text-gray-500">No members added yet.</div>
                  ) : (
                    members.map(m => (
                      <div key={m.id} className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-3">
                        <div>
                          <div className="font-medium">{m.name} {m.resident_id ? <span className="text-xs text-gray-500"> — {m.resident_id}</span> : null}</div>
                          <div className="text-xs text-gray-500">{m.contactNumber || '—'} · {m.email || '—'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-500 mr-2">{m.age ? `${m.age} yrs` : ''}</div>
                          <button type="button" onClick={() => setMembers(prev => prev.filter(x => String(x.id) !== String(m.id)))} className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm">Remove</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="text-xs text-gray-500">Members count: {members.length} / {householdSize}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !isValid()}
              className={`px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium ${isSaving || !isValid() ? 'opacity-60 cursor-not-allowed' : 'hover:from-green-700 hover:to-emerald-700'}`}
            >
              {isSaving ? 'Creating...' : (<span className="flex items-center gap-2"><PlusIcon className="w-4 h-4"/> Create Household</span>)}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default CreateHousehold;
