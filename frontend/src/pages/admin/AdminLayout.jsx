import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

/**
 * AdminLayout: header + nav + outlet for nested admin pages.
 * NavLink targets are prefixed with /admin so they match nested admin routes.
 */

export default function AdminLayout() {
  const navigate = useNavigate();

  // read user from localStorage (saved at login)
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const navClass = ({ isActive }) =>
    isActive
      ? "flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm text-sm font-semibold"
      : "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-200";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-[1440px] mx-auto px-5 py-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-5 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-md bg-blue-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor" aria-hidden>
                <path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Attendance Management System</p>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex items-center">
            <div className="text-right">
              <div className="font-semibold">{user?.name ?? user?.email ?? "Admin User"}</div>
              <div className="text-xs text-gray-500 -mt-0.5">{user?.role ?? "admin"}</div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 font-semibold border border-gray-900 px-3 py-1 rounded-md bg-white hover:bg-gray-100 flex items-center gap-2 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* Tabs */}
        <nav className="mt-8 mb-10">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            {/* Overview -> /admin (will be active for child admin routes too) */}
            <NavLink to="/admin" className={navClass}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z" />
              </svg>
              Overview
            </NavLink>

            {/* Users -> /admin/users */}
            <NavLink to="/admin/users" className={navClass}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              Users
            </NavLink>

            {/* Reports -> /admin/reports */}
            <NavLink to="/admin/reports" className={navClass}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M3 13h2v-2H3v2zm4 0h2v-2H7v2zm8-6v14h-2V7h-4v10H7V7h-.5L6 6v12h12v-12l-1-.5z" />
              </svg>
              Reports
            </NavLink>

            {/* Settings -> /admin/settings */}
            <NavLink to="/admin/settings" className={navClass}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M19.4 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.11-1.65a.5.5 0 00-.11-.64l-2-3.46a.5.5 0 00-.61-.22l-2.49 1c-.52-.4-1.07-.73-1.68-1l-.38-2.65A.492.492 0 0014 4h-4c-.24 0-.44.17-.49.41l-.38 2.65c-.61.27-1.16.6-1.68 1l-2.49-1a.5.5 0 00-.61.22l-2 3.46a.5.5 0 00.11.64l2.11 1.65c-.04.31-.06.63-.06.94s.02.63.06.94L2.6 14.59a.5.5 0 00-.11.64l2 3.46c.14.26.48.35.74.22l2.49-1c.52.4 1.07.73 1.68 1l.38 2.65c.05.24.25.41.49.41h4c.24 0 .44-.17.49-.41l.38-2.65c.61-.27 1.16-.6 1.68-1l2.49 1c.26.14.6.04.74-.22l2-3.46a.5.5 0 00-.11-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5S10.07 8.5 12 8.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
              </svg>
              Settings
            </NavLink>
          </div>
        </nav>

        {/* nested content */}
        <Outlet />
      </div>
    </div>
  );
}
