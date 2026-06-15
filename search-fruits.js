import OpenAI from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { OPENAI_API_KEY, QDRANT_URL, QDRANT_API_KEY } from "./config.js";
  
const client = new OpenAI({ apiKey: OPENAI_API_KEY });
const qdrant = new QdrantClient({ url: QDRANT_URL, apiKey: QDRANT_API_KEY });
  
async function searchFruits(query, limit = 3) {
  const res = await client.embeddings.create({
    model: "text-embedding-3-small", input: query });
  const results = await qdrant.search("taiwan_fruits", {
    vector: res.data[0].embedding, limit, with_payload: true });
  return results.map((r) => ({
    name: r.payload.name,
    score: r.score.toFixed(4),
    preview: r.payload.text.slice(0, 50) + "..." }));
}
  
// 3 種不同問法
const queries = [
  "甜度高的台灣水果推薦",
  "夏天盛產的水果有哪些",
  "適合作為高端禮品的台灣水果",
];
  
for (const q of queries) {
  console.log(`\n查詢：「${q}」`);
  const results = await searchFruits(q);
  results.forEach((r, i) =>
    console.log(`  ${i+1}. ${r.name}（相似度：${r.score}）`));
}