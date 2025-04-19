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

/**
 * 获取天气信息的工具
 */
server.tool(
  "get_weather",
  "Get current weather information for a location",
  {
    city: z.string().describe("The city name to get weather for"),
    country: z.string().optional().describe("The country code (optional)")
  },
  async ({ city, country }) => {
    try {
      // 这里使用 OpenWeatherMap API 作为示例
      // 实际使用时需要替换为您的 API key
      const API_KEY = process.env.OPENWEATHER_API_KEY;
      if (!API_KEY) {
        return {
          content: [
            {
              type: "text",
              text: "Error: OpenWeather API key not found. Please set OPENWEATHER_API_KEY environment variable."
            }
          ],
          isError: true
        };
      }

      const location = country ? `${city},${country}` : city;
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`
      );

      const weather = response.data;
      return {
        content: [
          {
            type: "text",
            text: `Weather in ${weather.name}:
- Temperature: ${weather.main.temp}°C
- Feels like: ${weather.main.feels_like}°C
- Humidity: ${weather.main.humidity}%
- Weather: ${weather.weather[0].description}
- Wind speed: ${weather.wind.speed} m/s`
          }
        ]
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return {
          content: [
            {
              type: "text",
              text: `Location not found: ${city}`
            }
          ],
          isError: true
        };
      }
      return {
        content: [
          {
            type: "text",
            text: `Error fetching weather data: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
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