import { SkillAnalysis } from '../types/skills';

export async function analyzeSkills(chatText: string): Promise<SkillAnalysis> {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    // Return mock data for demo purposes
    return {
      leadership: Math.floor(Math.random() * 40) + 60,
      collaborative: Math.floor(Math.random() * 40) + 50,
      analyticalThinking: Math.floor(Math.random() * 40) + 70,
      creativity: Math.floor(Math.random() * 40) + 40,
      problemSolving: Math.floor(Math.random() * 40) + 65
    };
  }

  try {
    // Use the local proxy for OpenAI calls
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: `You are an expert communication skills analyst. Analyze the provided chat conversation and extract any communication or professional skills you observe. For each skill, rate it on a scale of 0-100 based on evidence in the conversation. Respond ONLY with a valid JSON object where each key is the skill name and each value is the skill's rating (number between 0 and 100). Do not include any explanation or extra text—just output the JSON object.`
          },
          {
            role: "user",
            content: `Please analyze this chat conversation and provide skill ratings:\n\n${chatText}`
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    });
    if (!response.ok) throw new Error('OpenAI proxy error');
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }
    const skillsData = JSON.parse(content);
    return skillsData;
  } catch (error) {
    console.error('Error analyzing skills:', error);
    // Return mock data on error
    return {
      leadership: Math.floor(Math.random() * 40) + 60,
      collaborative: Math.floor(Math.random() * 40) + 50,
      analyticalThinking: Math.floor(Math.random() * 40) + 70,
      creativity: Math.floor(Math.random() * 40) + 40,
      problemSolving: Math.floor(Math.random() * 40) + 65
    };
  }
}