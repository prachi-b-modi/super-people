import React from 'react';
import { SkillAnalysis } from '../types/skills';

interface SkillsBreakdownProps {
  skills: SkillAnalysis;
}

const CHIP_COLORS = [
  'bg-green-100 text-green-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-yellow-100 text-yellow-700',
  'bg-pink-100 text-pink-700',
  'bg-orange-100 text-orange-700',
  'bg-teal-100 text-teal-700',
  'bg-gray-100 text-gray-700',
];



export default function SkillsBreakdown({ skills }: SkillsBreakdownProps) {
  const skillEntries = Object.entries(skills);
  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Skills Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillEntries.map(([skill, value], i) => (
            <div key={skill} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold w-fit ${CHIP_COLORS[i % CHIP_COLORS.length]}`}>{skill}</span>
              <span className="text-2xl font-bold">{value}%</span>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-1000 ease-out" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}