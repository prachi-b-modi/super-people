import React, { useState } from 'react';
import { MessageSquare, Sparkles, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onAnalyze: (chatText: string) => void;
  isAnalyzing: boolean;
}

export default function ChatInput({ onAnalyze, isAnalyzing }: ChatInputProps) {
  const [chatText, setChatText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatText.trim() && !isAnalyzing) {
      onAnalyze(chatText);
    }
  };

  const sampleChat = `Hey team! I've been thinking about our project timeline and I believe we need to reassess our approach. 

I analyzed the current bottlenecks and identified three key areas where we can optimize: 
1. Communication flow between departments
2. Resource allocation for critical tasks  
3. Quality assurance processes

I'd love to collaborate with everyone to brainstorm some creative solutions. What if we implemented a cross-functional team structure? We could also explore automation tools to streamline repetitive tasks.

I'm happy to lead this initiative and coordinate with stakeholders. Let's schedule a workshop to ideate and prototype some solutions. I think we can turn this challenge into an opportunity for innovation.

What are your thoughts? I'm open to feedback and excited to work together on this!`;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Chat Analysis</h2>
            <p className="text-gray-600 text-sm">Paste your chat conversation to analyze communication skills</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="Paste your chat conversation here..."
              className="w-full h-48 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400 bg-white/50"
              disabled={isAnalyzing}
            />
            <div className="absolute bottom-4 right-4 text-xs text-gray-400">
              {chatText.length} characters
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setChatText(sampleChat)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              disabled={isAnalyzing}
            >
              Use sample chat
            </button>
            
            <button
              type="submit"
              disabled={!chatText.trim() || isAnalyzing}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Add log
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}