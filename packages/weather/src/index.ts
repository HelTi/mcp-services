#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

/**
 * 创建MCP服务器实例
 */
const server = new McpServer({
  name: "weather",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

interface WeatherResponse {
  results: [
    {
      location: {
        id: string;
        name: string;
        country: string;
        path: string;
        timezone: string;
        timezone_offset: string;
      };
      daily: Array<{
        date: string;
        text_day: string;
        code_day: string;
        text_night: string;
        code_night: string;
        high: string;
        low: string;
        precip: string;
        wind_direction: string;
        wind_direction_degree: string;
        wind_speed: string;
        wind_scale: string;
        rainfall: string;
        humidity: string;
      }>;
      last_update: string;
    }
  ];
}

/**
 * 获取天气信息的工具
 */
server.tool(
  "get_weather",
  "获取天气预报信息",
  {
    city: z.string().describe("要获取天气预报的城市名称"),
    days: z
      .number()
      .optional()
      .describe("预测天数 (最大15, 默认3)"),
    language: z
      .string()
      .optional()
      .describe("响应语言 (默认: zh-Hans)"),
    unit: z
      .string()
      .optional()
      .describe("温度单位 (c 或 f, 默认: c)"),
  },
  async ({ city, days = 3, language = "zh-Hans", unit = "c" }) => {
    try {
      // 获取Seniverse API密钥
      const API_KEY = process.env.SENIVERSE_API_KEY;
      if (!API_KEY) {
        return {
          content: [
            {
              type: "text",
              text: "Error: Seniverse API key not found. Please set SENIVERSE_API_KEY environment variable.",
            },
          ],
          isError: true,
        };
      }

      // 发送请求获取天气预报数据
      const response = await axios.get<WeatherResponse>(
        `https://api.seniverse.com/v3/weather/daily.json?key=${API_KEY}&location=${encodeURIComponent(
          city
        )}&language=${language}&unit=${unit}&start=0&days=${days}`
      );

      // 解析响应数据 
      const { location, daily, last_update } = response.data.results[0];

      const forecastText = daily
        .map((day) => {
          return `${day.date}:
- 白天: ${day.text_day}, 夜间: ${day.text_night}
- 温度: ${day.low}°${unit.toUpperCase()} ~ ${day.high}°${unit.toUpperCase()}
- 降水概率: ${day.precip}%
- 风速: ${day.wind_speed}${unit === "c" ? "km/h" : "mph"}
- 湿度: ${day.humidity}%`;
        })
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: `${location.name} (${location.path}) 天气预报:
            
${forecastText}

最后更新时间: ${last_update}`,
          },
        ],
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.status || error.message;
        return {
          content: [
            {
              type: "text",
              text: `Error fetching weather data: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: "text",
            text: `Error fetching weather data: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

/**
 * 使用stdio传输启动服务器
 */
async function main() {
  console.error("Starting Weather MCP server...");

  const transport = new StdioServerTransport();

  try {
    await server.connect(transport);
    console.error("Weather MCP server running on stdio");
  } catch (error) {
    console.error("Error starting Weather MCP server:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
