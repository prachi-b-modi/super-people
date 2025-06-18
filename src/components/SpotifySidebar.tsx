import React from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, BarChart2, FileText, UserCircle2 } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Work Log', icon: <Brain className="w-5 h-5" /> },
  { to: '/skills', label: 'SkillWave', icon: <BarChart2 className="w-5 h-5" /> },
  { to: '/skills/resume', label: 'Resume', icon: <FileText className="w-5 h-5" /> },
];

export default function SpotifySidebar() {
  return (
    <aside className="h-screen w-60 bg-gradient-to-b from-[#191414] to-[#222] text-white flex flex-col shadow-2xl sticky top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-7 py-7 border-b border-[#222]/60">
        <div className="bg-[#1db954] rounded-full p-2">
          <svg height="32" width="32" viewBox="0 0 168 168" className="block">
            <circle cx="84" cy="84" r="84" fill="#1db954" />
            <path d="M119 113c-24-15-63-16-86-9-3 1-6-1-7-4-1-3 1-6 4-7 25-7 68-6 95 10 3 2 4 6 2 9-2 3-6 4-9 1zm10-22c-28-17-73-18-99-10-4 1-8-1-9-5-1-4 1-8 5-9 29-8 78-7 109 11 4 2 5 7 3 11-2 4-7 5-11 2zm12-23C97 46 53 45 28 52c-5 1-10-2-11-7-1-5 2-10 7-11 29-8 80-7 117 13 5 2 7 8 4 13-2 5-8 7-13 4z" fill="#fff"/>
          </svg>
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">SuperPeople</span>
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-3 rounded-lg font-semibold transition-all duration-150 hover:bg-[#282828] hover:text-white ${isActive ? 'bg-[#282828] text-[#1db954]' : 'text-white/80'}`
            }
            end={to === '/'}
          >
            {icon}
            <span className="text-lg">{label}</span>
          </NavLink>
        ))}
      </nav>
      {/* User/Profile */}
      <div className="px-7 py-8 mt-auto text-sm text-white/60 border-t border-[#222]/60 flex items-center gap-2">
        <UserCircle2 className="inline w-5 h-5 mr-1" />
        Welcome!
      </div>
    </aside>
  );
}
