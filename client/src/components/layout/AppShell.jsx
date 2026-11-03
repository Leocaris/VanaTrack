import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { api } from '../../api/apiClient';

export const AppShell = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const location = useLocation();

  // Determine current page title based on route
  const getPageTitle = (pathname) => {
    if (pathname === '/') return 'Impact Intelligence Dashboard';
    if (pathname.startsWith('/projects/')) return 'Project Intelligence Dossier';
    if (pathname.startsWith('/projects')) return 'Environmental Projects Registry';
    if (pathname.startsWith('/activities')) return 'Field Planting Activities & Evidence';
    if (pathname.startsWith('/survival')) return 'Tree Survival Rate Monitoring';
    if (pathname.startsWith('/map')) return 'Geospatial Projects Map';
    if (pathname.startsWith('/alerts')) return 'Smart Environmental Alerts';
    if (pathname.startsWith('/audit')) return 'Immutable Audit Trail History';
    return 'VanaTrack Platform';
  };

  // Fetch alert count periodically
  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const data = await api.get('/alerts');
        if (data.counts) {
          setAlertCount(data.counts.critical + data.counts.warning);
        }
      } catch (err) {
        // Silent fail
      }
    };

    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#f8faf9] dark:bg-[#071912] text-slate-800 dark:text-slate-100 overflow-hidden transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar alertCount={alertCount} />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar
              onCloseMobile={() => setMobileOpen(false)}
              alertCount={alertCount}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          title={getPageTitle(location.pathname)}
          alertCount={alertCount}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

