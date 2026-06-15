import { input } from "@inquirer/prompts";
import { client, DEFAULT_MODEL } from "./lib/openai.js";
import { toOpenAITool } from "./utils/func-tool.js";
import { currentTimeTool } from "./tools/current_time.js";
import { youbikeTool } from "./tools/youbike.js";
import { spinner } from "./utils/spinner.js";
  
// 只註冊兩個工具
const toolList = [currentTimeTool, youbikeTool];
const tools = toolList.map(toOpenAITool);
const AVAILABLE_TOOLS = Object.fromEntries(toolList.map((t) => [t.name, t.fn]));
  
const messages = [{
  role: "developer",
  content: `你是台北市交通生活助理，具備兩種能力：
1. 查詢現在的台灣時間（使用 get_current_time）
2. 查詢台北市各行政區的 YouBike 2.0 可租借站點（使用 get_youbike_by_area）
查詢 YouBike 時需行政區名稱（如大安區、信義區），若使用者說「台北市」請提示需具體行政區。
請用繁體中文回答，整合工具資料給出完整且有用的回覆。`
}];
  
try {
  while (true) {
    const q = (await input({ message: "請輸入問題：" })).trim();
    if (!q || q === "exit") break;
    messages.push({ role: "user", content: q });
  
    while (true) {
      const sp = spinner("思考中...").start();
      const res = await client.chat.completions.create({
        model: DEFAULT_MODEL, messages, tools, tool_choice: "auto" });
      sp.stop();
      const msg = res.choices[0].message;
      messages.push(msg);
      if (!msg.tool_calls?.length) { console.log(`\n${msg.content}\n`); break; }
      for (const tc of msg.tool_calls) {
        const result = await AVAILABLE_TOOLS[tc.function.name](JSON.parse(tc.function.arguments));
        messages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(result) });
      }
    }
  }
} catch (err) { if (err.name !== "ExitPromptError") throw err; }