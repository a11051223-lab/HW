import { input } from "@inquirer/prompts";
import { client, DEFAULT_MODEL } from "./lib/openai.js";
import { toOpenAITool } from "./utils/func-tool.js";
import { convertUnitTool } from "./tools/unit_converter.js";
import { spinner } from "./utils/spinner.js";
  
const tools = [toOpenAITool(convertUnitTool)];
const AVAILABLE_TOOLS = { convert_unit: convertUnitTool.fn };
  
const messages = [{ role: "developer",
  content: "你是智慧助理，擁有單位換算能力。請用繁體中文回答。" }];
  
try {
  while (true) {
    const q = (await input({ message: "請輸入問題：" })).trim();
    if (!q || q === "exit") break;
    messages.push({ role: "user", content: q });
  
    while (true) {  // 內層 loop 處理 tool calling
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