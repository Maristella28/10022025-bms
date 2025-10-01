import { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import modulePreloader from '../utils/modulePreloader';

// Custom hook for optimized navigation
export const useOptimizedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Preload modules on hover or focus
  const preloadModule = useCallback((path) => {
    const moduleName = path.split('/').pop();
    
    // Map paths to module names
    const moduleMap = {
      'requestDocuments': 'RequestDocuments',
      'projects': 'Projects',
      'myBenefits': 'MyBenefits',
      'blotterAppointment': 'BlotterAppointment',
      'organizationalChart': 'OrganizationalChart',
      'documentsRecords': 'DocumentsRecords',
      'residentsRecords': 'ResidentsRecords',
      'householdRecords': 'HouseholdRecords',
      'financialTracking': 'FinancialTracking'
    };

    const actualModuleName = moduleMap[moduleName];
    if (actualModuleName) {
      // Preload the module
      const importMap = {
        'RequestDocuments': () => import('../pages/residents/RequestDocuments'),
        'Projects': () => import('../pages/residents/Projects'),
        'MyBenefits': () => import('../pages/residents/modules/Programs/MyBenefits'),
        'BlotterAppointment': () => import('../pages/residents/BlotterAppointment'),
        'OrganizationalChart': () => import('../pages/residents/OrganizationalChart'),
        'DocumentsRecords': () => import('../pages/admin/DocumentsRecords'),
        'ResidentsRecords': () => import('../pages/admin/ResidentsRecords'),
        'HouseholdRecords': () => import('../pages/admin/HouseholdRecords'),
        'FinancialTracking': () => import('../pages/admin/FinancialTracking')
      };

      const importFn = importMap[actualModuleName];
      if (importFn) {
        modulePreloader.preloadModule(importFn, actualModuleName);
      }
    }
  }, []);

  // Optimized navigate function with preloading
  const optimizedNavigate = useCallback((path, options = {}) => {
    // Preload the target module before navigation
    preloadModule(path);
    
    // Navigate with a small delay to allow preloading
    setTimeout(() => {
      navigate(path, options);
    }, 50);
  }, [navigate, preloadModule]);

  // Preload adjacent modules when user lands on a page
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Define related modules for each page
    const relatedModules = {
      '/residents/dashboard': ['requestDocuments', 'projects'],
      '/residents/requestDocuments': ['projects', 'myBenefits'],
      '/residents/projects': ['requestDocuments', 'blotterAppointment'],
      '/admin/dashboard': ['documentsRecords', 'residentsRecords'],
      '/admin/documentsRecords': ['residentsRecords', 'householdRecords'],
      '/admin/residentsRecords': ['documentsRecords', 'financialTracking']
    };

    const related = relatedModules[currentPath];
    if (related) {
      // Preload related modules after a short delay
      setTimeout(() => {
        related.forEach(modulePath => {
          preloadModule(`/residents/${modulePath}`);
        });
      }, 1000);
    }
  }, [location.pathname, preloadModule]);

  return {
    navigate: optimizedNavigate,
    preloadModule,
    currentPath: location.pathname
  };
};

export default useOptimizedNavigation;
