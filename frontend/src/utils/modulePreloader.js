// Module preloader for better performance
class ModulePreloader {
  constructor() {
    this.preloadedModules = new Map();
    this.preloadingPromises = new Map();
  }

  // Preload a module and cache it
  async preloadModule(importFunction, moduleName) {
    // If already preloaded, return cached version
    if (this.preloadedModules.has(moduleName)) {
      return this.preloadedModules.get(moduleName);
    }

    // If currently preloading, return existing promise
    if (this.preloadingPromises.has(moduleName)) {
      return this.preloadingPromises.get(moduleName);
    }

    // Start preloading
    const preloadPromise = importFunction().then(module => {
      this.preloadedModules.set(moduleName, module);
      this.preloadingPromises.delete(moduleName);
      return module;
    }).catch(error => {
      console.warn(`Failed to preload module ${moduleName}:`, error);
      this.preloadingPromises.delete(moduleName);
      throw error;
    });

    this.preloadingPromises.set(moduleName, preloadPromise);
    return preloadPromise;
  }

  // Preload commonly used resident modules
  preloadResidentModules() {
    const modules = [
      { name: 'RequestDocuments', import: () => import('../pages/residents/RequestDocuments') },
      { name: 'Projects', import: () => import('../pages/residents/Projects') },
      { name: 'MyBenefits', import: () => import('../pages/residents/modules/Programs/MyBenefits') },
      { name: 'BlotterAppointment', import: () => import('../pages/residents/BlotterAppointment') },
      { name: 'OrganizationalChart', import: () => import('../pages/residents/OrganizationalChart') }
    ];

    modules.forEach(({ name, import: importFn }) => {
      this.preloadModule(importFn, name).catch(() => {
        // Silently handle preload failures
      });
    });
  }

  // Preload admin modules
  preloadAdminModules() {
    const modules = [
      { name: 'DocumentsRecords', import: () => import('../pages/admin/DocumentsRecords') },
      { name: 'ResidentsRecords', import: () => import('../pages/admin/ResidentsRecords') },
      { name: 'HouseholdRecords', import: () => import('../pages/admin/HouseholdRecords') },
      { name: 'FinancialTracking', import: () => import('../pages/admin/FinancialTracking') }
    ];

    modules.forEach(({ name, import: importFn }) => {
      this.preloadModule(importFn, name).catch(() => {
        // Silently handle preload failures
      });
    });
  }

  // Get preloaded module if available
  getPreloadedModule(moduleName) {
    return this.preloadedModules.get(moduleName);
  }

  // Clear cache (useful for memory management)
  clearCache() {
    this.preloadedModules.clear();
    this.preloadingPromises.clear();
  }
}

// Create singleton instance
const modulePreloader = new ModulePreloader();

// Auto-preload on idle
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  window.requestIdleCallback(() => {
    // Preload based on user role from localStorage
    const userRole = localStorage.getItem('role');
    if (userRole === 'residents' || userRole === 'resident') {
      modulePreloader.preloadResidentModules();
    } else if (userRole === 'admin' || userRole === 'staff') {
      modulePreloader.preloadAdminModules();
    }
  }, { timeout: 5000 });
}

export default modulePreloader;
