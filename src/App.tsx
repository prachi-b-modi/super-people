import React, { useState } from 'react';
import { Brain, Download, Share2 } from 'lucide-react';
import ChatInput from './components/ChatInput';
import CircularWaveform from './components/CircularWaveform';
import SkillsBreakdown from './components/SkillsBreakdown';
import { SkillAnalysis } from './types/skills';
import { analyzeSkills } from './services/openai';

function App() {
  const [skills, setSkills] = useState<SkillAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (chatText: string) => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeSkills(chatText);
      setSkills(analysis);
    } catch (error) {
      console.error('Error analyzing skills:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
    if (!skills) return;
    
    const data = {
      timestamp: new Date().toISOString(),
      skills: skills,
      summary: 'Skills analysis based on chat conversation'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skills-analysis.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!skills) return;
    
    const text = `My Skills Analysis:\n${Object.entries(skills)
      .map(([key, value]) => `${key}: ${value}%`)
      .join('\n')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Skills Analysis',
          text: text
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Skills Analyzer</h1>
                <p className="text-gray-600 text-sm">AI-powered communication skills assessment</p>
              </div>
            </div>
            
            {skills && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Chat Input */}
          <ChatInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

          {/* Results */}
          {skills && (
            <div className="space-y-8">
              {/* Circular Waveform */}
              <div className="flex justify-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">
                    Skills Visualization
                  </h3>
                  <CircularWaveform skills={skills} />
                  <p className="text-gray-600 text-sm text-center mt-4 max-w-md mx-auto">
                    Each waveform represents a skill. The amplitude of the wave corresponds to your proficiency level.
                  </p>
                </div>
              </div>

              {/* Skills Breakdown */}
              <SkillsBreakdown skills={skills} />
            </div>
          )}

          {/* Info Section */}
          {!skills && !isAnalyzing && (
            <div className="text-center py-16">
              <div className="max-w-2xl mx-auto">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Brain className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Analyze Your Communication Skills
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Paste a chat conversation above to get an AI-powered analysis of your communication skills.
                  Our system evaluates leadership, collaboration, analytical thinking, creativity, and problem-solving abilities.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  {['Leadership', 'Collaborative', 'Analytical', 'Creative', 'Problem Solving'].map((skill) => (
                    <div key={skill} className="bg-white/60 rounded-lg p-3 border border-white/40">
                      <div className="font-medium text-gray-800">{skill}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white/80 backdrop-blur-sm border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Skills analysis powered by AI. Results are based on communication patterns and should be used as guidance.
            </p>
            <p className="text-xs mt-2 text-gray-500">
              To enable full AI analysis, add your OpenAI API key to the VITE_OPENAI_API_KEY environment variable.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;