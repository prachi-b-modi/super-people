import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { getProductManagementSkills } from '../services/weaviate';
import { generateProductManagementResumeBullets, extractProductManagementInsights, ResumeInsights } from '../services/resume';

export default function ResumePage() {
  const [resumeHtml, setResumeHtml] = useState<string | null>(null);
  const [bullets, setBullets] = useState<string[] | null>(null);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [skills, setSkills] = useState<{ text: string; distance: number }[] | null>(null);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  // Insights from OpenAI
  const [insights, setInsights] = useState<ResumeInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerateError(null);
    setGenerateLoading(true);
    try {
      const result = await generateProductManagementResumeBullets();
      setBullets(result);

      // build simple HTML for download
      const html = `<ul>${result.map((b) => `<li>${b}</li>`).join('')}</ul>`;
      setResumeHtml(html);
    } catch (err) {
      console.error(err);
      setGenerateError('Failed to generate resume. Please try again.');
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resumeHtml) return;
    const blob = new Blob([resumeHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShowSkills = async () => {
    setSkills(null);
    setSkillsError(null);
    setSkillsLoading(true);
    try {
      const result = await getProductManagementSkills();
      setSkills(result);
    } catch (err: any) {
      setSkillsError('Failed to fetch skills from Weaviate.');
    } finally {
      setSkillsLoading(false);
    }
  };

  const handleShowInsights = async () => {
    setInsights(null);
    setInsightsError(null);
    setInsightsLoading(true);
    try {
      const accs = await getProductManagementSkills();
      const res = await extractProductManagementInsights(accs, { accomplishmentLimit: 2 });
      setInsights(res);
    } catch (err) {
      console.error(err);
      setInsightsError('Failed to fetch insights from OpenAI.');
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-16">
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
          {resumeHtml && (
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Role input */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-gray-900">
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Role</label>
          <input
            type="text"
            placeholder="e.g. Product Manager"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleGenerate}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Generate Resume
          </button>
          <button
            onClick={handleShowSkills}
            className="mt-4 ml-4 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Show Skills
          </button>
          <button
            onClick={handleShowInsights}
            className="mt-4 ml-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Show Insights
          </button>
        </div>

        {/* Generation status / errors */}
        {generateLoading && <div className="text-blue-600">Generating resume...</div>}
        {generateError && <div className="text-red-600">{generateError}</div>}

        {/* Resume preview */}
        {bullets && bullets.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-white/20">
            <ul className="list-disc pl-6 space-y-1">
              {bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills results */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-gray-900">
          <h2 className="text-lg font-semibold mb-2">Product Management Skills Extracted</h2>
          {skillsLoading && <div className="text-blue-600">Loading skills...</div>}
          {skillsError && <div className="text-red-600">{skillsError}</div>}
          {skills && skills.length > 0 && (
            <ul className="list-disc pl-6 space-y-1">
              {skills.map((item, idx) => (
                <li key={idx}>
                  <span className="font-medium text-gray-800">{item.text}</span>
                  <span className="ml-2 text-xs text-gray-500">(distance: {item.distance})</span>
                </li>
              ))}
            </ul>
          )}
          {skills && skills.length === 0 && !skillsLoading && <div className="text-gray-500">No skills found.</div>}
        </div>

        {/* Insights results */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-gray-900">
          <h2 className="text-lg font-semibold mb-2">OpenAI Resume Insights</h2>
          {insightsLoading && <div className="text-blue-600">Loading insights...</div>}
          {insightsError && <div className="text-red-600">{insightsError}</div>}
          {insights && (
            <div className="space-y-4">
              {/* Accomplishments */}
              {insights.accomplishments.length > 0 && (
                <div>
                  <h3 className="font-medium">Accomplishments</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {insights.accomplishments.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technical skills */}
              {insights.technicalSkills.length > 0 && (
                <div>
                  <h3 className="font-medium">Technical Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {insights.technicalSkills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-black rounded-md text-sm">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Behavioral skills */}
              {insights.behavioralSkills.length > 0 && (
                <div>
                  <h3 className="font-medium">Behavioral Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {insights.behavioralSkills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-100 text-black rounded-md text-sm">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
