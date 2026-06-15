import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";
  
function convertUnit({ value, from_unit, to_unit }) {
  const key = `${from_unit.toLowerCase()}_${to_unit.toLowerCase()}`;
  const conversions = {
    celsius_fahrenheit:  (v) => v * 9 / 5 + 32,
    fahrenheit_celsius:  (v) => (v - 32) * 5 / 9,
    km_mile:             (v) => v * 0.621371,
    mile_km:             (v) => v / 0.621371,
    kg_lb:               (v) => v * 2.20462,
    lb_kg:               (v) => v / 2.20462,
  };
  if (!conversions[key])
    return { error: `不支援的換算組合：${from_unit} → ${to_unit}` };
  
  const result = Math.round(conversions[key](value) * 10000) / 10000;
  return { value, from_unit, to_unit, result,
    formula: `${value} ${from_unit} = ${result} ${to_unit}` };
}
  
export const convertUnitTool = defineTool({
  name: "convert_unit",
  description: "進行單位換算，支援攝氏/華氏、公里/英里、公斤/磅的互相換算",
  fn: convertUnit,
  parameters: z.object({
    value:     z.number().describe("要換算的數值，如 25"),
    from_unit: z.string().describe("原始單位：celsius/fahrenheit/km/mile/kg/lb"),
    to_unit:   z.string().describe("目標單位：celsius/fahrenheit/km/mile/kg/lb"),
  }),
});