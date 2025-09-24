// Helper functions for formatting names
export const formatName = (resident) => {
  if (!resident) return '';
  const first = resident.first_name || '';
  const middle = resident.middle_name ? ` ${resident.middle_name}` : '';
  const last = resident.last_name ? ` ${resident.last_name}` : '';
  const suffix = resident.name_suffix && resident.name_suffix.toLowerCase() !== 'none' 
    ? ` ${resident.name_suffix}` 
    : '';
  return `${first}${middle}${last}${suffix}`.trim();
};

// Calculate resident status based on update history
export const getResidentStatus = (resident) => {
  if (resident.update_status) return resident.update_status;
  const dateStr = resident.last_modified || resident.updated_at;
  if (!dateStr) return 'Needs Verification';
  const lastUpdate = new Date(dateStr);
  if (isNaN(lastUpdate)) return 'Needs Verification';
  
  const now = new Date();
  const monthsDiff = (now.getFullYear() - lastUpdate.getFullYear()) * 12 
    + (now.getMonth() - lastUpdate.getMonth());
    
  if (monthsDiff <= 6) return 'Active';
  if (monthsDiff <= 12) return 'Outdated';
  return 'Needs Verification';
};

// Compute analytics data
export const computeAnalytics = (residents, type = 'monthly') => {
  if (!residents?.length) return [];

  const data = residents.reduce((acc, resident) => {
    const date = new Date(resident.created_at || resident.updated_at);
    const key = type === 'monthly' 
      ? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      : date.toISOString().split('T')[0];
      
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(data)
    .map(([date, count]) => ({
      date,
      registrations: count
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

// Export to CSV
export const exportToCSV = (residents) => {
  if (!residents?.length) {
    throw new Error('No data to export');
  }

  const headers = [
    'Resident ID',
    'Name',
    'Status',
    'Verification',
    'Last Modified',
    'For Review'
  ];

  const rows = residents.map(r => [
    r.resident_id ?? r.id ?? '',
    formatName(r),
    getResidentStatus(r),
    r.verification_status || 'Pending',
    r.last_modified ? new Date(r.last_modified).toLocaleString() : '',
    r.for_review ? 'Yes' : 'No'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        const value = cell?.toString() ?? '';
        return value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    )
  ].join('\n');

  return csvContent;
};

// Export to PDF
export const exportToPDF = async (residents) => {
  if (!residents?.length) {
    throw new Error('No data to export');
  }
  
  // This is a placeholder - implement actual PDF generation logic
  throw new Error('PDF export not yet implemented');
};