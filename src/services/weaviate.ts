import weaviate, { WeaviateClient } from 'weaviate-ts-client';
import OpenAI from 'openai';

const WEAVIATE_URL = import.meta.env.VITE_WEAVIATE_URL as string;
const WEAVIATE_API_KEY = import.meta.env.VITE_WEAVIATE_API_KEY as string | undefined;

// Initialise client (browser-friendly)
export const weaviateClient: WeaviateClient | null = WEAVIATE_URL
  ? weaviate.client({
      scheme: WEAVIATE_URL.startsWith('https') ? 'https' : 'http',
      host: WEAVIATE_URL.replace(/^https?:\/\//, ''),
      apiKey: WEAVIATE_API_KEY ? new weaviate.ApiKey(WEAVIATE_API_KEY) : undefined,
    })
  : null;

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface Accomplishment {
  id?: string;
  text: string;
  timestamp?: string;
  sourceType: 'upload' | 'typed';
}

const CLASS_NAME = 'Accomplishment';

async function ensureSchema() {
  if (!weaviateClient) return;
  const exists = await weaviateClient.schema.exists(CLASS_NAME);
  if (exists) return;

  await weaviateClient.schema.classCreator().withClass({
    class: CLASS_NAME,
    description: 'User accomplishments and notes',
    vectorizer: 'none',
    properties: [
      { name: 'text', dataType: ['text'] },
      { name: 'sourceType', dataType: ['text'] },
      { name: 'timestamp', dataType: ['date'] },
    ],
  }).do();
}

export async function storeAccomplishment(acc: Accomplishment): Promise<void> {
  if (!weaviateClient) return;

  await ensureSchema();

  // Embed text
  const embResp = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: acc.text,
  });
  const vector = embResp.data[0].embedding;

  await weaviateClient.data.creator()
    .withClassName(CLASS_NAME)
    .withProperties({
      text: acc.text,
      sourceType: acc.sourceType,
      timestamp: acc.timestamp ?? new Date().toISOString(),
    })
    .withVector(vector)
    .do();
}

export async function fetchLatestAccomplishments(limit = 20): Promise<Accomplishment[]> {
  if (!weaviateClient) return [];
  await ensureSchema();

  const res = await weaviateClient.graphql.get()
    .withClassName(CLASS_NAME)
    .withFields('text sourceType timestamp')
    .withLimit(limit)
    .withSort([{ path: ['timestamp'], order: 'desc' }])
    .do();

  return (res?.data?.Get?.[CLASS_NAME] ?? []) as Accomplishment[];
}

/**
 * Queries Weaviate for accomplishments most related to product management.
 * Returns and prints the closest skills/accomplishments.
 */
export async function getProductManagementSkills(limit = 10): Promise<{ text: string; distance: number }[]> {
  if (!weaviateClient) return [];
  await ensureSchema();

  // Combined query string describing product-management concepts
  const query = [
    "product management",
    "roadmap",
    "user stories",
    "market research",
    "MVP",
    "stakeholders",
    "user feedback",
    "feature prioritization",
    "go-to-market",
    "product launch",
  ].join(", ");

  try {
    // Embed the query
    const embResp = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    const vector = embResp.data[0].embedding;

    // Vector similarity search
    const res = await weaviateClient.graphql
      .get()
      .withClassName(CLASS_NAME)
      .withFields("text _additional { distance }")
      .withNearVector({ vector })
      .withLimit(limit)
      .do();

    const results = (res?.data?.Get?.[CLASS_NAME] ?? []).map((item: any) => ({
      text: item.text,
      distance: item._additional?.distance ?? null,
    }));

    console.log("Closest product-management accomplishments:", results);
    return results;
  } catch (err) {
    console.error("Error fetching product-management skills from Weaviate:", err);
    throw err; // let callers handle and display friendly message
  }
}
