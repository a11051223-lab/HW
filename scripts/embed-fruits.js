import OpenAI from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { OPENAI_API_KEY, QDRANT_URL, QDRANT_API_KEY } from "../config.js";
  
const client = new OpenAI({ apiKey: OPENAI_API_KEY });
const qdrant = new QdrantClient({ url: QDRANT_URL, apiKey: QDRANT_API_KEY });
const COLLECTION = "taiwan_fruits";
  
// 5 筆台灣水果知識
const fruits = [
  { id: 1, name: "芒果",
    text: "芒果是台灣夏季最具代表性的水果，主要產地在台南、屏東。愛文芒果果肉金黃、香甜多汁，甜度18-22度。每年6至8月盛產，被譽為水果之王。富含維生素A、C，適合鮮食或製作芒果冰、芒果乾。" },
  { id: 2, name: "鳳梨",
    text: "鳳梨主要產地在台南、嘉義、屏東。金鑽鳳梨甜度高、酸甜適中、不澀嘴。盛產期3至8月，含鳳梨酵素有助消化。常用於製作鳳梨酥，是台灣最具代表性的伴手禮食材。" },
  { id: 3, name: "釋迦",
    text: "釋迦主要產地在台東縣，全球知名。果肉白嫩、濃甜，甜度可達22-26度。採收期9月至隔年2月為秋冬水果。人工採收、單價高，富含維生素C、鎂、鐵，常作為高端禮品。" },
  { id: 4, name: "蓮霧",
    text: "蓮霧以屏東黑金剛最為頂級，果實深紅、口感爽脆、水分多。盛產期11月至隔年3月的冬季。套袋技術讓色澤鮮紅、甜度達14度以上。熱量低，有清熱解毒功效，是台灣特有農業驕傲。" },
  { id: 5, name: "芭樂",
    text: "芭樂又稱番石榴，一年四季皆可種植，主要產地在彰化、南投。珍珠芭樂口感脆甜，維生素C含量極高（每100克218mg，是蘋果8倍）。產量豐富、價格親民，是台灣家庭最常購買的水果。" },
];
  
// 建立 collection
try {
  await qdrant.createCollection(COLLECTION, {
    vectors: { size: 1536, distance: "Cosine" } });
} catch { console.log("Collection 已存在，跳過建立"); }
  
// 逐筆 embed 並 upsert
const points = [];
for (const fruit of fruits) {
  const res = await client.embeddings.create({
    model: "text-embedding-3-small", input: fruit.text });
  points.push({
    id: fruit.id,
    vector: res.data[0].embedding,
    payload: { name: fruit.name, text: fruit.text },
  });
  console.log(`✓ Embedded: ${fruit.name}`);
}
await qdrant.upsert(COLLECTION, { wait: true, points });
console.log(`\n成功將 ${fruits.length} 筆水果資料加入知識庫！`);