// Route configuration with module permissions mapping
export const routeConfig = {
  // Admin/Staff routes (subject to permissions)
  common: [
    { path: "dashboard", element: null, module: "dashboard" },
    { path: "documentsRecords", element: null, module: "documentsRecords" },
    { path: "residentsRecords", element: null, module: "residentsRecords" },
    { path: "householdRecords", element: null, module: "householdRecords" },
    { path: "blotterRecords", element: null, module: "blotterRecords" },
    { path: "financialTracking", element: null, module: "financialTracking" },
    { path: "barangayOfficials", element: null, module: "barangayOfficials" },
    { path: "staff", element: null, module: "staffManagement" },
    { path: "communicationAnnouncement", element: null, module: "communicationAnnouncement" },
    { path: "projectManagement", element: null, module: "projectManagement" },
    { path: "socialServices", element: null, module: "socialServices" },
    { path: "disasterEmergency", element: null, module: "disasterEmergency" },
    { path: "inventoryAssets", element: null, module: "inventoryAssets" },
    { path: "activityLogs", element: null, module: "activityLogs" },
    
    // Additional admin-specific routes that were missing
    { path: "social-services", element: null, module: "socialServices" },
    { path: "assets-management", element: null, module: "inventoryAssets" },
    { path: "officials-management", element: null, module: "barangayOfficials" },
    { path: "staff-management", element: null, module: "staffManagement" },
    { path: "create-household", element: null, module: "householdRecords" }
  ],
  
  // Resident-specific routes (always accessible to residents)
  residents: [
    { path: "dashboard", element: null, module: "dashboard" },
    { path: "profile", element: null, module: "profile" },
    { path: "projects", element: null, module: "projects" },
    { path: "requestDocuments", element: null, module: "requestDocuments" },
    { path: "requestAssets", element: null, module: "requestAssets" },
    { path: "generateBlotter", element: null, module: "generateBlotter" },
    { path: "statusDocumentRequests", element: null, module: "statusDocumentRequests" },
    { path: "statusBlotterRequests", element: null, module: "statusBlotterRequests" },
    { path: "blotterAppointment", element: null, module: "blotterAppointment" },
    { path: "organizationalChart", element: null, module: "organizationalChart" },
    { path: "myBenefits", element: null, module: "myBenefits" },
    { path: "addFeedback", element: null, module: "addFeedback" }
  ],
  
  // Special paths that don't require module permissions
  unrestricted: [
    "edit-profile"
  ]
};