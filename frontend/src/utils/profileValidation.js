// List of required fields for profile completion
export const requiredFields = [
    'first_name',
    'last_name',
    'birth_date',
    'sex',
    'civil_status',
    'religion',
    'current_address',
    'years_in_barangay',
    'voter_status',
    'housing_type',
    'classified_sector',
    'educational_attainment',
    'occupation_type',
    'salary_income',
    'current_photo'
];

// Map field names to readable labels
export const fieldLabels = {
    first_name: 'First Name',
    last_name: 'Last Name',
    birth_date: 'Birth Date',
    sex: 'Sex',
    civil_status: 'Civil Status',
    religion: 'Religion',
    current_address: 'Current Address',
    years_in_barangay: 'Years in Barangay',
    voter_status: 'Voter Status',
    housing_type: 'Housing Type',
    classified_sector: 'Classified Sector',
    educational_attainment: 'Educational Attainment',
    occupation_type: 'Occupation Type',
    salary_income: 'Salary/Income',
    current_photo: 'Profile Photo'
};

// Function to check if profile is complete
export const isProfileComplete = (profile) => {
    if (!profile) return false;
    
    // Check for resident_id as primary indicator of completion
    // Note: Do NOT treat presence of resident_id alone as completion.
    // Some flows set resident_id before the profile fields are filled.
    // Removing the short-circuit ensures required fields are validated.
    
    const missingFields = requiredFields.filter(field => {
        const value = profile[field];
        
        // Special handling for different field types
        if (field === 'current_photo') {
            return !value && !profile.avatar; // Accept either current_photo or avatar
        }
        
        if (field === 'birth_date' && value) {
            return false; // Any valid date is acceptable
        }
        
        if (typeof value === 'boolean') {
            return false; // Boolean values are always considered complete
        }
        
        if (field === 'special_categories' || field === 'vaccine_received') {
            return false; // These arrays are optional
        }
        
        // General case
        return !value || 
               (typeof value === 'string' && value.trim() === '') ||
               (Array.isArray(value) && value.length === 0);
    });

    console.log('Missing Fields:', missingFields);
    return missingFields.length === 0;
};

// Function to get missing fields
export const getMissingFields = (profile) => {
    if (!profile) return requiredFields;
    
    return requiredFields.filter(field => {
        const value = profile[field];
        return !value || 
               (typeof value === 'string' && value.trim() === '') ||
               (Array.isArray(value) && value.length === 0);
    });
};

// Function to calculate profile completion percentage
export const getProfileCompletionPercentage = (profile) => {
    if (!profile) return 0;
    
    const completedFields = requiredFields.filter(field => {
        const value = profile[field];
        return value && 
               !(typeof value === 'string' && value.trim() === '') &&
               !(Array.isArray(value) && value.length === 0);
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
};