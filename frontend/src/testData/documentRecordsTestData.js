// Test data for DocumentsRecords component - similar to backend test_create_admin_user.php
// Set useTestData to true in DocumentsRecords.jsx to use this data instead of API

export const useTestData = false; // Toggle this to false to fetch live backend data

export const testDocumentRecords = [
  {
    id: 1,
    user: { id: 1, name: 'Juan Dela Cruz' },
    resident: {
      resident_id: 'RES-001',
      first_name: 'Juan',
      middle_name: 'Santos',
      last_name: 'Dela Cruz',
      name_suffix: '',
      age: 35,
      sex: 'Male',
      civil_status: 'Married',
      contact_number: '09123456789',
      email: 'juan.delacruz@example.com',
      current_address: '123 Main St, Barangay Centro',
      birth_date: '1989-05-15',
      birth_place: 'Manila',
      religion: 'Catholic',
      nationality: 'Filipino',
      years_in_barangay: 10
    },
    documentType: 'Brgy Clearance',
    certificationType: null,
    certificationData: null,
    status: 'Approved',
    requestDate: '2024-01-15T10:30:00Z',
    approvedDate: '2024-01-16T14:20:00Z',
    completedAt: '2024-01-16T14:20:00Z',
    priority: 'normal',
    processingNotes: 'Document processed successfully',
    estimatedCompletion: '2024-01-16',
    purpose: 'Employment',
    remarks: 'Urgent processing requested',
    pdfPath: '/uploads/documents/brgy_clearance_1.pdf',
    photoPath: null,
    photoType: null,
    photoMetadata: null,
    fields: { purpose: 'Employment', remarks: 'Urgent processing requested' }
  },
  {
    id: 2,
    user: { id: 2, name: 'Maria Santos' },
    resident: {
      resident_id: 'RES-002',
      first_name: 'Maria',
      middle_name: 'Garcia',
      last_name: 'Santos',
      name_suffix: '',
      age: 28,
      sex: 'Female',
      civil_status: 'Single',
      contact_number: '09987654321',
      email: 'maria.santos@example.com',
      current_address: '456 Oak Ave, Barangay Poblacion',
      birth_date: '1996-03-22',
      birth_place: 'Cebu',
      religion: 'Catholic',
      nationality: 'Filipino',
      years_in_barangay: 5
    },
    documentType: 'Cedula',
    certificationType: null,
    certificationData: null,
    status: 'Processing',
    requestDate: '2024-01-20T09:15:00Z',
    approvedDate: null,
    completedAt: null,
    priority: 'high',
    processingNotes: 'Waiting for verification',
    estimatedCompletion: '2024-01-25',
    purpose: 'Tax purposes',
    remarks: 'For BIR requirements',
    pdfPath: null,
    photoPath: '/uploads/photos/cedula_2.jpg',
    photoType: 'jpeg',
    photoMetadata: { size: 2048000 },
    fields: { purpose: 'Tax purposes', remarks: 'For BIR requirements' }
  },
  {
    id: 3,
    user: { id: 3, name: 'Pedro Reyes' },
    resident: {
      resident_id: 'RES-003',
      first_name: 'Pedro',
      middle_name: 'Lopez',
      last_name: 'Reyes',
      name_suffix: '',
      age: 42,
      sex: 'Male',
      civil_status: 'Married',
      contact_number: '09112233445',
      email: 'pedro.reyes@example.com',
      current_address: '789 Pine St, Barangay Hills',
      birth_date: '1982-11-08',
      birth_place: 'Davao',
      religion: 'Protestant',
      nationality: 'Filipino',
      years_in_barangay: 15
    },
    documentType: 'Brgy Indigency',
    certificationType: null,
    certificationData: null,
    status: 'Pending',
    requestDate: '2024-01-22T16:45:00Z',
    approvedDate: null,
    completedAt: null,
    priority: 'urgent',
    processingNotes: 'Requires barangay captain approval',
    estimatedCompletion: '2024-01-28',
    purpose: 'Medical assistance',
    remarks: 'For hospital bill subsidy',
    pdfPath: null,
    photoPath: null,
    photoType: null,
    photoMetadata: null,
    fields: { purpose: 'Medical assistance', remarks: 'For hospital bill subsidy' }
  },
  {
    id: 4,
    user: { id: 4, name: 'Ana Gonzales' },
    resident: {
      resident_id: 'RES-004',
      first_name: 'Ana',
      middle_name: 'Cruz',
      last_name: 'Gonzales',
      name_suffix: '',
      age: 31,
      sex: 'Female',
      civil_status: 'Married',
      contact_number: '09988776655',
      email: 'ana.gonzales@example.com',
      current_address: '321 Elm St, Barangay Valley',
      birth_date: '1993-07-12',
      birth_place: 'Baguio',
      religion: 'Catholic',
      nationality: 'Filipino',
      years_in_barangay: 8
    },
    documentType: 'Brgy Certification',
    certificationType: 'Birth Certificate',
    certificationData: {
      child_name: 'Miguel Gonzales',
      child_birth_date: '2020-05-10',
      registration_office: 'Local Civil Registry',
      registration_date: '2020-05-15'
    },
    status: 'Rejected',
    requestDate: '2024-01-18T11:20:00Z',
    approvedDate: null,
    completedAt: null,
    priority: 'normal',
    processingNotes: 'Missing required documents',
    estimatedCompletion: null,
    purpose: 'School enrollment',
    remarks: 'Child birth certificate needed',
    pdfPath: null,
    photoPath: null,
    photoType: null,
    photoMetadata: null,
    fields: { purpose: 'School enrollment', remarks: 'Child birth certificate needed' }
  },
  {
    id: 5,
    user: { id: 5, name: 'Carlos Mendoza' },
    resident: {
      resident_id: 'RES-005',
      first_name: 'Carlos',
      middle_name: 'Reyes',
      last_name: 'Mendoza',
      name_suffix: 'Jr.',
      age: 55,
      sex: 'Male',
      civil_status: 'Widowed',
      contact_number: '09115556677',
      email: 'carlos.mendoza@example.com',
      current_address: '654 Maple Ave, Barangay Heights',
      birth_date: '1969-12-03',
      birth_place: 'Iloilo',
      religion: 'Catholic',
      nationality: 'Filipino',
      years_in_barangay: 25
    },
    documentType: 'Brgy Business Permit',
    certificationType: null,
    certificationData: null,
    status: 'Approved',
    requestDate: '2024-01-10T08:00:00Z',
    approvedDate: '2024-01-12T13:30:00Z',
    completedAt: '2024-01-12T13:30:00Z',
    priority: 'normal',
    processingNotes: 'Business permit issued',
    estimatedCompletion: '2024-01-12',
    purpose: 'Business operation',
    remarks: 'Sari-sari store permit',
    pdfPath: '/uploads/documents/business_permit_5.pdf',
    photoPath: '/uploads/photos/business_5.jpg',
    photoType: 'jpeg',
    photoMetadata: { size: 1536000 },
    fields: { purpose: 'Business operation', remarks: 'Sari-sari store permit' }
  }
];

// Function to get test data (similar to how backend creates test admin user)
// This also spreads requestDate across the last 12 months so analytics show meaningful trends.
export const getTestDocumentRecords = () => {
  console.log('📊 Loading test document records data...');
  const now = new Date();
  // Clone and distribute dates
  return testDocumentRecords.map((rec, idx) => {
    const monthsAgo = (testDocumentRecords.length - 1 - idx) % 12; // spread across last 12 months
    const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, Math.min(15 + (idx % 10), 28), 10, 30, 0);
    const approvedOffsetDays = rec.status === 'Approved' ? 1 : null;

    const requestDateISO = date.toISOString();
    const approvedDateISO = approvedOffsetDays ? new Date(date.getTime() + approvedOffsetDays * 86400000).toISOString() : null;

    return {
      ...rec,
      requestDate: requestDateISO,
      approvedDate: approvedDateISO,
      completedAt: approvedDateISO,
      estimatedCompletion: approvedDateISO ? approvedDateISO.split('T')[0] : rec.estimatedCompletion,
    };
  });
};

// Function to simulate API response format
export const getMockApiResponse = () => {
  return {
    data: testDocumentRecords,
    status: 200,
    statusText: 'OK'
  };
};
