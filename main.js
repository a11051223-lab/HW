import { input } from "@inquirer/prompts";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";
import { initMessage, addMessage, getMessages } from "./db/messages.js";

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

// ★ 星座機器人 system prompt（50字以上）
const SYSTEM_PROMPT = `你是「星語」，一位專業的西洋占星師。
你的專業領域包含：十二星座性格特質分析、星座配對相容性、
本週星座運勢預測、工作與感情建議，以及水星逆行等星象影響。
說話風格神秘優雅，善用星象意象，喜歡在建議中融入星座象徵。
請務必記住使用者提到的星座資訊以提供個人化建議。
請用繁體中文回答，每次回應附上實用的星座小建議。`;

await initMessage(SYSTEM_PROMPT);

try {
  while (true) {
    const userQuestion = (await input({ message: "請輸入問題：" })).trim();
    if (!userQuestion) continue;
    if (userQuestion.toLowerCase() === "exit") { console.log("星語再會~"); break; }

    await addMessage(userQuestion);

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: getMessages(),  // ← 帶入完整對話歷史（記憶）
    });

    const content = response.choices[0].message.content;
    console.log(`\n星語：${content}\n`); 
    await addMessage(content, "assistant");
  }
} catch (err) {
  if (err.name === "ExitPromptError") console.log("\n星語再會~");
  else throw err;
}
