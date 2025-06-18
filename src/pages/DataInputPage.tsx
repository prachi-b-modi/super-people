import React, { useState } from 'react';
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import { analyzeSkills } from '../services/openai';
import { storeAccomplishment, fetchLatestAccomplishments } from '../services/weaviate';
import CircularWaveform from '../components/CircularWaveform';
import SkillsBreakdown from '../components/SkillsBreakdown';
import { SkillAnalysis } from '../types/skills';

export default function DataInputPage() {
  const [latestSkill, setLatestSkill] = useState<{ text: string; timestamp?: string; sourceType?: string } | null>(null);
  const [latestSkillError, setLatestSkillError] = useState<string | null>(null);

  const handlePrintLatestSkill = async () => {
    setLatestSkill(null);
    setLatestSkillError(null);
    try {
      const results = await fetchLatestAccomplishments(1);
      if (!results || results.length === 0) {
        setLatestSkillError('No recent skill found in Weaviate.');
        return;
      }
      setLatestSkill(results[0]);
    } catch (err: any) {
      setLatestSkillError('Error fetching latest skill from Weaviate.');
    }
  };
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [skills, setSkills] = useState<SkillAnalysis | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) setText(result);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsAnalyzing(true);
    try {
      // 1. Store text in Weaviate (vector DB)
      await storeAccomplishment({ text, sourceType: fileName ? 'upload' : 'typed' });

      // 2. Analyze skills via OpenAI (temporary – later call Hypermode)
      const analysis = await analyzeSkills(text);
      setSkills(analysis);
      setError(null);
    } catch (err: any) {
      console.error('Error analyzing skills', err);
      setError(err?.message || 'Analysis/storage failed – check console.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-950 px-4">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Input Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 flex flex-col gap-8 w-full max-w-xl mx-auto animate-pop">
  <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Log your accomplishments</h2>
  <form onSubmit={handleAnalyze} className="space-y-6">
            {/* File upload */}
            <div>
              <label htmlFor="file" className="flex items-center gap-2 text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-700">
                <Upload className="w-4 h-4" />
                {fileName ? fileName : 'Upload a .txt / .md / .pdf'}
              </label>
              <input id="file" type="file" accept=".txt,.md,.pdf" onChange={handleFileChange} className="hidden" />
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                className="w-full h-48 p-4 border border-white/20 rounded-xl focus:ring-2 focus:ring-[#1db954] focus:border-transparent resize-none text-white placeholder-gray-300 bg-white/20 backdrop-blur"
                placeholder="Or type / paste your accomplishments here ..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isAnalyzing}
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-400">{text.length} characters</div>
            </div>

            {/* Analyze Button */}
            <button
              type="submit"
              disabled={!text.trim() || isAnalyzing}
              className="px-8 py-3 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold rounded-full shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Add Log
                </>
              )}
            </button>

            {/* Print Latest Skill Button */}
            <button
              type="button"
              onClick={handlePrintLatestSkill}
              className="mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              Print Latest Skill
            </button>

            {/* Latest Skill Result */}
            {latestSkillError && (
              <div className="mt-4 bg-red-600/90 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in">
                <span className="font-semibold">{latestSkillError}</span>
              </div>
            )}
            {latestSkill && (
              <div className="mt-4 bg-green-100 border border-green-300 text-green-900 px-4 py-3 rounded-lg shadow animate-fade-in">
                <div><span className="font-semibold">Latest Skill Text:</span> {latestSkill.text}</div>
                {latestSkill.timestamp && (
                  <div className="text-xs text-gray-500 mt-1">Timestamp: {new Date(latestSkill.timestamp).toLocaleString()}</div>
                )}
                {latestSkill.sourceType && (
                  <div className="text-xs text-gray-500 mt-1">Source: {latestSkill.sourceType}</div>
                )}
              </div>
            )}
            {error && (
              <div className="mt-4 bg-red-600/90 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-4 animate-fade-in">
                <span className="font-semibold">{error}</span>
                <button onClick={() => setError(null)} className="ml-4 px-2 py-1 rounded bg-white/20 hover:bg-white/40 text-white">Dismiss</button>
              </div>
            )}
          </form>
        </div>

        {/* Recent Logs Carousel */}
        <div className="w-full">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Logs</h3>
          <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
            {[
              { date: "Jun 17 '25", bg: 'from-[#1ed760] to-[#1db954]' },
              { date: "Jun 16 '25", bg: 'from-[#509bf5] to-[#2563eb]' },
              { date: "Jun 15 '25", bg: 'from-[#f0943f] to-[#ef476f]' },
            ].map((item) => (
              <div
                key={item.date}
                className={`min-w-[14rem] snap-center rounded-3xl p-6 text-white font-bold text-lg shadow-xl bg-gradient-to-br ${item.bg} animate-pop`}
              >
                {item.date}
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {skills && (
          <>
            <div className="flex justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Skills Visualization</h3>
                <CircularWaveform skills={skills} />
              </div>
            </div>
            <SkillsBreakdown skills={skills} />
          </>
        )}
      </main>
    </div>
  );
}
