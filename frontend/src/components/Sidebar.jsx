import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard, Users, FileText, Home, Book,
  DollarSign, UserCog, Megaphone, Handshake, AlertTriangle,
  Boxes, Projector, Activity
} from 'lucide-react';

const Sidebar = ({ permissions: propPermissions = {} }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Combine prop permissions with user permissions, preferring user permissions
  const permissions = React.useMemo(() => ({
    ...propPermissions,
    ...user?.permissions
  }), [propPermissions, user?.permissions]);

  const iconSize = 18;

  const userRole = user?.role || localStorage.getItem('role');

  // Single source of truth for all menu items
  // Resident-specific menu items
  const residentMenuItems = [
    { 
      title: "Request Documents",
      icon: <FileText size={iconSize} />,
      path: `/${userRole}/requestDocuments`,
      module: "resident_docs"
    },
    {
      title: "Request Assets",
      icon: <Boxes size={iconSize} />,
      path: `/${userRole}/requestAssets`,
      module: "resident_assets"
    },
    {
      title: "Report Incident",
      icon: <Book size={iconSize} />,
      path: `/${userRole}/generateBlotter`,
      module: "resident_blotter"
    },
    {
      title: "Document Status",
      icon: <Activity size={iconSize} />,
      path: `/${userRole}/statusDocumentRequests`,
      module: "resident_status"
    }
  ];

  const allMenuItems = [
    { 
      title: "Dashboard", 
      icon: <LayoutDashboard size={iconSize} />, 
      path: `/${userRole}/dashboard`,
      module: "dashboard"
    },
    { 
      title: "Residents Records", 
      icon: <Users size={iconSize} />, 
      path: `/${userRole}/residentsRecords`,
      module: "residentsRecords"
    },
    { 
      title: "Document Records", 
      icon: <FileText size={iconSize} />, 
      path: `/${userRole}/documentsRecords`,
      module: "documentsRecords"
    },
    { 
      title: "Household Records", 
      icon: <Home size={iconSize} />, 
      path: `/${userRole}/householdRecords`,
      module: "householdRecords"
    },
    { 
      title: "Blotter Records", 
      icon: <Book size={iconSize} />, 
      path: `/${userRole}/blotterRecords`,
      module: "blotterRecords"
    },
    { 
      title: "Financial Management", 
      icon: <DollarSign size={iconSize} />, 
      path: `/${userRole}/financialTracking`,
      module: "financialTracking"
    },
    { 
      title: "Barangay Officials", 
      icon: <UserCog size={iconSize} />, 
      path: `/${userRole}/barangayOfficials`,
      module: "barangayOfficials"
    },
    { 
      title: "Staff Management", 
      icon: <Users size={iconSize} />, 
      path: `/${userRole}/staff`,
      module: "staffManagement"
    },
    { 
      title: "Communication", 
      icon: <Megaphone size={iconSize} />, 
      path: `/${userRole}/communicationAnnouncement`,
      module: "communicationAnnouncement"
    },
    { 
      title: "Social Services", 
      icon: <Handshake size={iconSize} />, 
      path: `/${userRole}/socialServices`,
      module: "socialServices"
    },
    { 
      title: "Disaster Response", 
      icon: <AlertTriangle size={iconSize} />, 
      path: `/${userRole}/disasterEmergency`,
      module: "disasterEmergency"
    },
    { 
      title: "Projects", 
      icon: <Projector size={iconSize} />, 
      path: `/${userRole}/projectManagement`,
      module: "projectManagement"
    },
    { 
      title: "Inventory", 
      icon: <Boxes size={iconSize} />, 
      path: `/${userRole}/inventoryAssets`,
      module: "inventoryAssets"
    },
    { 
      title: "Activity Logs", 
      icon: <Activity size={iconSize} />, 
      path: `/${userRole}/activityLogs`,
      module: "activityLogs"
    }
  ];

  // Function to get the base path based on user role
  const getBasePath = (role) => {
    switch (role) {
      case 'admin': return '/admin';
      case 'staff': return '/staff';
      case 'treasurer': return '/treasurer';
      case 'resident': return '/resident';
      default: return '';
    }
  };

  // Filter menu items based on permissions
  const filteredMenuItems = React.useMemo(() => {
    // If user is a resident, show resident-specific menu
    if (user?.role === 'resident') {
      return residentMenuItems;
    }

    // For other roles, filter based on permissions
    return allMenuItems.filter(item => {
      // Admin sees everything
      if (user?.role === 'admin') return true;

      // For staff, check module permissions
      if (user?.role === 'staff') {
        // Check the specific permission using the item's module name
        const modulePermission = permissions[item.module];
        console.log(`Checking permission for ${item.module}:`, modulePermission);
        // Return true only if the permission is explicitly true
        return modulePermission === true;
      }

      return false;
    });
  }, [user?.role, permissions]);

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-gradient-to-b from-green-900 to-green-800 shadow-2xl border-r border-green-700">
      <div className="flex flex-col h-full px-4 py-6 overflow-y-auto text-white space-y-6 scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-green-800">

        {/* Header */}
        <div className="flex items-center justify-center gap-3">
          <Megaphone className="text-lime-300 w-7 h-7" />
          <h2 className="text-2xl font-extrabold tracking-wide text-lime-100">
            {user?.role?.toUpperCase() || "PANEL"}
          </h2>
        </div>

        <hr className="border-green-700" />

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-1">
            {filteredMenuItems.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={idx}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group
                      ${isActive
                        ? "bg-green-700 text-white font-semibold border-l-4 border-lime-300"
                        : "hover:bg-green-700 hover:text-white text-green-100"
                      }`}
                  >
                    <span className="group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="truncate text-sm tracking-wide">{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="text-sm text-green-300 text-center pt-6 border-t border-green-700">
          <p>&copy; 2025 Barangay System</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
