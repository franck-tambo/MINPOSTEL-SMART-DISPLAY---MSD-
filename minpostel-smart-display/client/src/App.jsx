import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import DashboardOverview from './pages/DashboardOverview';
import AnnouncementsPage from './pages/AnnouncementsPage';
import MeetingsPage from './pages/MeetingsPage';
import EventsPage from './pages/EventsPage';
import CommunicationsPage from './pages/CommunicationsPage';
import UrgentMessagesPage from './pages/UrgentMessagesPage';
import LocationsPage from './pages/LocationsPage';
import MediaLibraryPage from './pages/MediaLibraryPage';
import PublicDisplayPage from './pages/PublicDisplayPage';
import MobileVisitorPage from './pages/MobileVisitorPage';
import DisplayPreviewPage from './pages/DisplayPreviewPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Kiosk Screen Route */}
            <Route path="/display/:screenId" element={<PublicDisplayPage />} />
            <Route path="/display" element={<Navigate to="/display/MINPOSTEL-MAIN-ENTRANCE-01" replace />} />

            {/* Mobile Visitor Route */}
            <Route path="/visitor" element={<MobileVisitorPage />} />
            <Route path="/visitor/meeting/:id" element={<MobileVisitorPage />} />
            <Route path="/visitor/event/:id" element={<MobileVisitorPage />} />
            <Route path="/visitor/:id" element={<MobileVisitorPage />} />
            <Route path="/locations" element={<MobileVisitorPage />} />

            {/* Admin Auth Route */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Admin Dashboard Protected Routes */}
            <Route path="/dashboard" element={<AdminLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="meetings" element={<MeetingsPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="communications" element={<CommunicationsPage />} />
              <Route path="urgent-messages" element={<UrgentMessagesPage />} />
              <Route path="media" element={<MediaLibraryPage />} />
              <Route path="locations" element={<LocationsPage />} />
              <Route path="display-preview" element={<DisplayPreviewPage />} />
              <Route path="activity-logs" element={<ActivityLogsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
  );
}
