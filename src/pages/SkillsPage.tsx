import React, { useEffect, useState } from 'react';
import CircularWaveform from '../components/CircularWaveform';
import SkillsBreakdown from '../components/SkillsBreakdown';
import { SkillAnalysis } from '../types/skills';

// TODO: Replace mock with Hypermode + Weaviate fetch
const mockSkills: SkillAnalysis = {
  leadership: 80,
  collaborative: 70,
  analyticalThinking: 90,
  creativity: 65,
  problemSolving: 78
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillAnalysis | null>(null);

  useEffect(() => {
    // Fetch skills from backend / Hypermode in future. Using mock for now.
    setSkills(mockSkills);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-16">
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">SkillWave</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {skills ? (
          <>
            <div className="flex justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Skills Visualization</h3>
                <CircularWaveform skills={skills} />
              </div>
            </div>
            <SkillsBreakdown skills={skills} />
          </>
        ) : (
          <p className="text-center text-gray-600">Loading skills...</p>
        )}
      </main>
    </div>
  );
}
