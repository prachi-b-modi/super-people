import React from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, FileText, BarChart2, UserCircle2 } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Work log', icon: <Brain className="w-5 h-5" /> },
  { to: '/skills', label: 'SkillWave', icon: <BarChart2 className="w-5 h-5" /> },
  { to: '/skills/resume', label: 'Resume', icon: <FileText className="w-5 h-5" /> },
  // Add more items as needed
];

export default function LeftSidebar() {
  return (
    <aside className="h-screen w-56 bg-gradient-to-b from-blue-900 to-purple-900 text-white flex flex-col shadow-xl sticky top-0 z-20">
      <div className="flex items-center gap-3 px-6 py-8">
        <Brain className="w-8 h-8 text-white" />
        <span className="text-2xl font-bold tracking-tight">Skills Analyzer</span>
      </div>
      <nav className="flex-1 px-2 space-y-2">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors duration-200 hover:bg-white/10 hover:text-white ${isActive ? 'bg-white/20 text-white' : 'text-blue-100'}`
            }
            end={to === '/'}
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-8 mt-auto text-xs text-blue-200/70">
        <UserCircle2 className="inline w-4 h-4 mr-1" />
        Welcome!
      </div>
    </aside>
  );
}
