import { getProductManagementSkills } from './weaviate';
import OpenAI from 'openai';

/**
 * Call Hypermode chat-completion API.
 * Adjust endpoint/model if your Hypermode account differs.
 */
async function callHypermode(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('http://localhost:4000/api/hypermode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',

    },
    body: JSON.stringify({
      model: 'hypermode-mixtral-8x7b',
      messages: [
        { role: 'system', content: 'You are an expert resume writer.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Hypermode API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  return data.choices?.[0]?.message?.content ?? '';
}

/**
 * Generates polished resume bullet points for a Product Manager role.
 *
 * Steps:
 * 1. Retrieve the most relevant accomplishments using `getProductManagementSkills`.
 * 2. Ask Hypermode to choose the best subset and rewrite them.
 * 3. Return cleaned bullet-point strings.
 *
 * @param options.queryLimit  How many accomplishments to fetch from Weaviate (default 10)
 * @param options.bulletLimit Maximum bullets Hypermode should return (default 5)
 */
export async function generateProductManagementResumeBullets(options: { queryLimit?: number; bulletLimit?: number } = {}): Promise<string[]> {
  const { queryLimit = 10, bulletLimit = 5 } = options;

  // Ensure API key present
  const apiKey = import.meta.env.VITE_HYPERMODE_API_KEY as string | undefined;
  if (!apiKey) throw new Error('Missing VITE_HYPERMODE_API_KEY env variable.');

  // 1. Retrieve accomplishments from Weaviate
  const accs = await getProductManagementSkills(queryLimit);
  if (accs.length === 0) return [];

  // 2. Build prompt for Hypermode
  const context = accs
    .map((a, i) => `${i + 1}. ${a.text}`)
    .join('\n');

  const prompt = `You are an expert resume writer. A user has provided a list of accomplishments that are somewhat related to product management. Please:\n` +
    `1. Review the accomplishments and select up to ${bulletLimit} that BEST demonstrate strong product-management skills and impact.\n` +
    `2. Rewrite the selected accomplishments into professional, detailed, metric-driven resume bullet points for a Product Manager role.\n` +
    `3. Return ONLY the polished bullets, each on its own line beginning with the \"•\" symbol.\n\n` +
    `Candidate accomplishments:\n${context}`;

  // 3. Call Hypermode
  const raw = await callHypermode(prompt, apiKey);

  // 4. Normalise into array
  return raw
    .split(/\n+/)
    .map((line) => line.replace(/^[-•\s]+/, '').trim())
    .filter((line) => line.length > 0);
}

/**
 * Structured insights extracted from a candidate's accomplishments.
 */
export interface ResumeInsights {
  accomplishments: string[]; // Polished resume bullets
  technicalSkills: string[]; // Single-word technical skills
  behavioralSkills: string[]; // Single-word soft skills
}

/**
 * Given an array of accomplishments (output of `getProductManagementSkills`), this function:
 * 1. Selects and rewrites the most relevant ones as polished resume bullets.
 * 2. Extracts technical skills (single words) related to product management.
 * 3. Extracts behavioral/soft skills (single words).
 *
 * The model is instructed to return STRICT minified JSON to allow robust parsing.
 */
export async function extractProductManagementInsights(
  accs: { text: string; distance: number }[],
  {
    accomplishmentLimit = 8,
    model = 'gpt-4o-mini',
  }: { accomplishmentLimit?: number; model?: string } = {},
): Promise<ResumeInsights> {
  // Quick short-circuit
  if (accs.length === 0) {
    return { accomplishments: [], technicalSkills: [], behavioralSkills: [] };
  }

  // Ensure OpenAI key is set
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!apiKey) throw new Error('Missing VITE_OPENAI_API_KEY env variable.');

  // Browser-friendly client
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  // Build context string (numbered)
  const context = accs
    .slice(0, accomplishmentLimit)
    .map((a, i) => `${i + 1}. ${a.text}`)
    .join('\n');

  const prompt = `Analyse the candidate accomplishments provided below. Perform these steps:\n` +
    `1. Choose the items that BEST highlight product-management impact.\n` +
    `2. Rewrite each chosen item as a professional, metric-driven resume bullet (begin with a verb).\n` +
    `3. From ALL items, list single-word technical skills relevant to product management.\n` +
    `4. From ALL items, list single-word behavioural/soft skills shown.\n` +
    `Respond ONLY with minified JSON in the following schema (no markdown, no explanations): \n{\n  "accomplishments": ["..."],\n  "technical_skills": ["..."],\n  "behavioral_skills": ["..."]\n}\nEnsure the key name "accomplishments" is used exactly as shown.\n\n` +
    `Candidate accomplishments:\n${context}`;

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: 'You are an expert resume writer.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
  });

  const raw = completion.choices?.[0]?.message?.content?.trim() ?? '{}';

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse OpenAI JSON response:', err, raw);
    // Attempt to extract JSON block if it's within code fences or prose
    const match = raw.match(/\{[\s\S]*}/);
    parsed = match ? JSON.parse(match[0]) : {};
  }

  let accList: any =
    parsed.accomplishments ??
    parsed.accomplishment ??
    parsed.bullets ??
    parsed.resume_bullets ??
    parsed.accomplishments_bullets ??
    parsed.accomplishment_bullets ??
    parsed.selected_accomplishments ??
    [];
  if (typeof accList === 'string') {
    accList = accList.split(/\n|\r|\u2022|•/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  }

  // Fallback: if still empty, try to pull bullet-like lines from raw output
  if (Array.isArray(accList) && accList.length === 0) {
    accList = raw
      .split(/\n|\r/)
      .map((s) => s.replace(/^[-•\s]+/, '').trim())
      .filter((s) => s.length > 0 && s.split(' ').length > 3); // heuristic: sentences
  }

  return {
    accomplishments: accList,
    technicalSkills: parsed.technical_skills ?? parsed.technicalSkills ?? [],
    behavioralSkills: parsed.behavioral_skills ?? parsed.behavioralSkills ?? [],
  };
}
