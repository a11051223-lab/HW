import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";
  
const YOUBIKE_API = "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json";
  
async function getYoubikeByArea({ area, min_available = 1, limit = 5 }) {
  const res = await fetch(YOUBIKE_API);
  const data = await res.json();
  const stations = data
    .filter((s) => s.act === "1" && s.sarea === area && s.available_rent_bikes >= min_available)
    .sort((a, b) => b.available_rent_bikes - a.available_rent_bikes)
    .slice(0, limit)
    .map((s) => ({
      name: s.sna.replace(/^YouBike2\.0_/, ""),
      address: s.ar,
      available_rent: s.available_rent_bikes,
    }));
  if (!stations.length)
    return { error: `${area} 目前無可租借站點（請確認行政區名稱）` };
  return { area, stations };
}
  
export const youbikeTool = defineTool({
  name: "get_youbike_by_area",
  description: "依台北市行政區名稱查詢 YouBike 2.0 可租借站點。請用完整行政區名稱如大安區、信義區。",
  fn: getYoubikeByArea,
  parameters: z.object({
    area:          z.string().describe("台北市行政區名稱，如：大安區、信義區、內湖區"),
    min_available: z.number().default(1).describe("最少可租借數量，預設 1"),
    limit:         z.number().default(5).describe("回傳最多幾個站點，預設 5"),
  }),
});