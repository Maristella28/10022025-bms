    import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { PlusIcon } from '@heroicons/react/24/outline';
    import axios from '../../../../utils/axiosConfig';
    import Navbar from '../../../../components/Navbar';
    import Sidebar from '../../../../components/Sidebar';
    import { UserIcon, DocumentTextIcon, MapPinIcon, ClockIcon, ExclamationTriangleIcon, PaperClipIcon, ChatBubbleLeftRightIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/solid';

    const complaintTypes = [
    'Physical Injury',
    'Verbal Abuse',
    'Property Damage',
    'Theft',
    'Noise Complaint',
    'Other',
    ];

    const initialForm = {
    resident_id: '',
    complainant_name: '',
    respondent_name: '',
    complaint_type: '',
    complaint_details: '',
    incident_date: '',
    incident_time: '',
    incident_location: '',
    witnesses: '',
    supporting_documents: null,
    preferred_action: '',
    contact_number: '',
    email: '',
    remarks: '',
    };

    const NewComplaint = ({ onSubmit, loading }) => {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [residents, setResidents] = useState([]);
    const [residentLoading, setResidentLoading] = useState(false);
    const [residentSearch, setResidentSearch] = useState('');

    useEffect(() => {
        setResidentLoading(true);
        axios.get('/admin/residents')
            .then(res => {
                setResidents(res.data.residents || []);
            })
            .catch(() => setResidents([]))
            .finally(() => setResidentLoading(false));
    }, []);

    const handleResidentSelect = (e) => {
        const residentId = e.target.value;
        setForm(f => ({ ...f, resident_id: residentId }));
        if (!residentId) return;
        const selected = residents.find(r => String(r.id) === String(residentId));
        if (selected) {
            setForm(f => ({
                ...f,
                resident_id: selected.resident_id, // Use the resident_id field
                complainant_name: `${selected.first_name} ${selected.middle_name ? selected.middle_name + ' ' : ''}${selected.last_name}${selected.name_suffix && selected.name_suffix.toLowerCase() !== 'none' ? ' ' + selected.name_suffix : ''}`.trim(),
                contact_number: selected.mobile_number || selected.contact_number || '', // Check both fields
                email: selected.email || '',
            }));
        }
    };

    const validate = () => {
        const errs = {};
        if (!form.resident_id) errs.resident_id = 'Resident ID is required';
        if (!form.complainant_name) errs.complainant_name = 'Complainant name is required';
        if (!form.respondent_name) errs.respondent_name = 'Respondent name is required';
        if (!form.complaint_type) errs.complaint_type = 'Complaint type is required';
        if (!form.complaint_details) errs.complaint_details = 'Complaint details are required';
        if (!form.incident_date) errs.incident_date = 'Incident date is required';
        if (!form.incident_time) errs.incident_time = 'Incident time is required';
        if (!form.incident_location) errs.incident_location = 'Incident location is required';
        if (!form.contact_number) errs.contact_number = 'Contact number is required';
        if (!form.email) errs.email = 'Email is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
        setForm({ ...form, [name]: files[0] });
        } else {
        setForm({ ...form, [name]: value });
        }
        setErrors({ ...errors, [name]: undefined });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        // Prepare form data for file upload
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
        });
        await axios.post('/blotter-records', formData);
        alert('Blotter complaint submitted successfully!');
        setForm(initialForm);
        setErrors({});
        navigate('/admin/blotterRecords');
    };

    const handleCancel = () => {
        setForm(initialForm);
        setErrors({});
        navigate('/admin/blotterRecords'); // Navigate to BlotterRecords admin page
    };

    // Filter residents by search
    const filteredResidents = residents.filter(r => {
        const name = `${r.first_name} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name}${r.name_suffix && r.name_suffix.toLowerCase() !== 'none' ? ' ' + r.name_suffix : ''}`.toLowerCase();
        return (
            name.includes(residentSearch.toLowerCase()) ||
            String(r.residents_id).includes(residentSearch)
        );
    });

    return (
        <>
            <Navbar />
            <Sidebar />
            <main className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
                <div className="bg-white rounded-3xl shadow-2xl border border-green-100 w-full max-w-2xl p-0 relative mt-10 mx-auto overflow-hidden">
                    {/* Modern Colored Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 rounded-t-3xl flex items-center gap-3 shadow-md">
                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
                        <h2 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-lg">Add New Blotter Complaint</h2>
                    </div>
                    <form className="space-y-8 px-8 py-8" onSubmit={handleSubmit} encType="multipart/form-data">
                        {/* Resident Picker */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-green-700 flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-green-500" /> Select Resident
                            </h3>
                            <div className="flex flex-col md:flex-row gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder="Search by name or ID..."
                                    className="w-full md:w-1/2 border border-gray-300 rounded-xl px-4 py-3 mb-2 md:mb-0 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 shadow-sm"
                                    value={residentSearch}
                                    onChange={e => setResidentSearch(e.target.value)}
                                    disabled={residentLoading}
                                />
                                <select
                                    className="w-full md:w-1/2 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 shadow-sm"
                                    value={form.resident_id}
                                    onChange={handleResidentSelect}
                                    disabled={residentLoading}
                                >
                                    <option value="">Select Resident ID</option>
                                    {residentLoading ? (
                                        <option>Loading...</option>
                                    ) : (
                                        residents.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.id} - {r.first_name} {r.middle_name ? r.middle_name + ' ' : ''}{r.last_name}{r.name_suffix && r.name_suffix.toLowerCase() !== 'none' ? ' ' + r.name_suffix : ''}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            {errors.resident_id && <p className="text-xs text-red-500 mt-1">{errors.resident_id}</p>}
                        </div>

                        {/* Section: Complainant & Respondent */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-green-700 flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5 text-green-500" /> Complainant & Respondent
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Complainant Name</label>
                                    <input
                                        type="text"
                                        name="complainant_name"
                                        value={form.complainant_name}
                                        onChange={handleChange}
                                        className={`w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 shadow-sm ${errors.complainant_name ? 'border-red-400' : ''}`}
                                        placeholder="Complainant Name"
                                        disabled
                                    />
                                    {errors.complainant_name && <p className="text-xs text-red-500 mt-1">{errors.complainant_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Respondent Name</label>
                                    <input
                                        type="text"
                                        name="respondent_name"
                                        value={form.respondent_name}
                                        onChange={handleChange}
                                        className={`w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 shadow-sm ${errors.respondent_name ? 'border-red-400' : ''}`}
                                        placeholder="Enter Respondent Name"
                                    />
                                    {errors.respondent_name && <p className="text-xs text-red-500 mt-1">{errors.respondent_name}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section: Incident Details */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-green-700 flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-5 h-5 text-green-500" /> Incident Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1 flex items-center gap-1"><ClockIcon className="w-4 h-4 text-green-400" /> Incident Date</label>
                                    <input
                                        type="date"
                                        name="incident_date"
                                        value={form.incident_date}
                                        onChange={handleChange}
                                        className={`w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 shadow-sm ${errors.incident_date ? 'border-red-400' : ''}`}
                                    />
                                    {errors.incident_date && <p className="text-xs text-red-500 mt-1">{errors.incident_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1 flex items-center gap-1"><ClockIcon className="w-4 h-4 text-green-400" /> Incident Time</label>
                                    <input
                                        type="time"
                                        name="incident_time"
                                        value={form.incident_time}
                                        onChange={handleChange}
                                        className={`w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 shadow-sm ${errors.incident_time ? 'border-red-400' : ''}`}
                                    />
                                    {errors.incident_time && <p className="text-xs text-red-500 mt-1">{errors.incident_time}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold mb-1 flex items-center gap-1"><MapPinIcon className="w-4 h-4 text-green-400" /> Incident Location</label>
                                    <input
                                        type="text"
                                        name="incident_location"
                                        value={form.incident_location}
                                        onChange={handleChange}
                                        className={`w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 shadow-sm ${errors.incident_location ? 'border-red-400' : ''}`}
                                        placeholder="Enter Incident Location"
                                    />
                                    {errors.incident_location && <p className="text-xs text-red-500 mt-1">{errors.incident_location}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section: Complaint Details */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-green-700 flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5 text-green-500" /> Complaint Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Complaint Type</label>
                                    <select
                                        name="complaint_type"
                                        value={form.complaint_type}
                                        onChange={handleChange}
                                        className={`w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 shadow-sm ${errors.complaint_type ? 'border-red-400' : ''}`}
                                    >
                                        <option value="">Select Complaint Type</option>
                                        {complaintTypes.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {errors.complaint_type && <p className="text-xs text-red-500 mt-1">{errors.complaint_type}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold mb-1">Complaint Details</label>
                                    <textarea
                                        name="complaint_details"
                                        value={form.complaint_details}
                                        onChange={handleChange}
                                        className={`w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 shadow-sm ${errors.complaint_details ? 'border-red-400' : ''}`}
                                        placeholder="Enter complaint details"
                                        rows={3}
                                    />
                                    {errors.complaint_details && <p className="text-xs text-red-500 mt-1">{errors.complaint_details}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section: Additional Info */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-green-700 flex items-center gap-2">
                                <PaperClipIcon className="w-5 h-5 text-green-500" /> Additional Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Witnesses (comma separated)</label>
                                    <input
                                        type="text"
                                        name="witnesses"
                                        value={form.witnesses}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 shadow-sm"
                                        placeholder="e.g. Juan Dela Cruz, Maria Santos"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1 flex items-center gap-1"><PaperClipIcon className="w-4 h-4 text-green-400" /> Supporting Documents (optional)</label>
                                    <input
                                        type="file"
                                        name="supporting_documents"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Preferred Action/Resolution</label>
                                    <input
                                        type="text"
                                        name="preferred_action"
                                        value={form.preferred_action}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 shadow-sm"
                                        placeholder="e.g. Mediation, Settlement, etc."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1 flex items-center gap-1"><PhoneIcon className="w-4 h-4 text-green-400" /> Contact Number</label>
                                    <input
                                        type="text"
                                        name="contact_number"
                                        value={form.contact_number}
                                        onChange={handleChange}
                                        className={`w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 shadow-sm ${errors.contact_number ? 'border-red-400' : ''}`}
                                        placeholder="Enter Contact Number"
                                        disabled
                                    />
                                    {errors.contact_number && <p className="text-xs text-red-500 mt-1">{errors.contact_number}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1 flex items-center gap-1"><EnvelopeIcon className="w-4 h-4 text-green-400" /> Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className={`w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 shadow-sm ${errors.email ? 'border-red-400' : ''}`}
                                        placeholder="Enter Email"
                                        disabled
                                    />
                                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold mb-1">Remarks (optional)</label>
                                    <textarea
                                        name="remarks"
                                        value={form.remarks}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 shadow-sm"
                                        placeholder="Enter any remarks"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300 shadow-sm"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                                disabled={loading}
                            >
                                {loading ? 'Adding...' : 'Add'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
    };

    export default NewComplaint;
