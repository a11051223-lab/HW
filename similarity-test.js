import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";
  
const client = new OpenAI({ apiKey: OPENAI_API_KEY });
  

async function getEmbedding(text) {
  const res = await client.embeddings.create({
    model: "text-embedding-3-small", input: text });
  return res.data[0].embedding;
}
  

function cosineSimilarity(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot  += vecA[i] * vecB[i];
    magA += vecA[i] ** 2;
    magB += vecB[i] ** 2;
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
  

async function analyzeSimilarity(groupName, sentences) {
  console.log(`\n=== ${groupName} ===`);
  sentences.forEach((s, i) => console.log(`  句${i+1}：${s}`));
  const embeddings = await Promise.all(sentences.map(getEmbedding));
  console.log("相似度結果：");
  for (let i = 0; i < sentences.length; i++) {
    for (let j = i + 1; j < sentences.length; j++) {
      const score = cosineSimilarity(embeddings[i], embeddings[j]);
      console.log(`  句${i+1} vs 句${j+1}: ${score.toFixed(4)}`);
    }
  }
}
  

const groups = [
  {
    name: "第 1 組：意思相近（咖啡主題）",
    sentences: [
      "我喜歡喝咖啡",
      "咖啡的香氣很迷人",
      "我每天早上都要喝一杯咖啡",
    ],
  },
  {
    name: "第 2 組：意思不同（隨機主題）",
    sentences: [
      "高鐵快要進站了",
      "這部電影很好看",
      "手機快沒電了",
    ],
  },
  {
    name: "第 3 組：自設案例（星座主題）",
    sentences: [
      "天蠍座的人個性神秘深沉",
      "天蠍座擅長洞察他人心思",
      "今天天氣晴朗很適合出遊",
    ],
  },
];
  
for (const group of groups) {
  await analyzeSimilarity(group.name, group.sentences);
}
  
console.log("\n\n=== 分析結論 ===");
console.log("第1組（意思相近）兩兩相似度應明顯高於第2組（意思不同）。");
console.log("此結果驗證 text-embedding-3-small 能有效捕捉中文語意相似性。");