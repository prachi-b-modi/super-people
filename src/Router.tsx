import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import DataInputPage from './pages/DataInputPage';
import SkillsPage from './pages/SkillsPage';
import ResumePage from './pages/ResumePage';
import SpotifySidebar from './components/SpotifySidebar';

const Layout = () => (
  <div className="flex min-h-screen">
    <SpotifySidebar />
    <main className="flex-1 bg-gradient-to-br from-[#181818] to-[#222] text-white min-h-screen">
      <Outlet />
    </main>
  </div>
);

const Router = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<DataInputPage />} />
      <Route path="/skills" element={<SkillsPage />} />
      <Route path="/skills/resume" element={<ResumePage />} />
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

export default Router;
