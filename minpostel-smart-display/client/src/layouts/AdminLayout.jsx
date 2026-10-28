import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        fontFamily: 'Inter, sans-serif',
        color: '#134074',
        fontSize: '1.1rem',
        fontWeight: 600
      }}>
        Chargement de la session MINPOSTEL...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-admin-slate)', width: '100%', transition: 'background-color 0.25s ease' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        <TopHeader />
        <main style={{ flex: 1, backgroundColor: 'var(--bg-admin-slate)', paddingBottom: '3rem', width: '100%', transition: 'background-color 0.25s ease' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
