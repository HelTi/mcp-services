#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { registerCalculatorTools } from "./tools/calculator.js";
import { registerInfoResources } from "./resources/info.js";

/**
 * 创建MCP服务器实例
 */
const server = new McpServer({
  name: "greeting",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

/**
 * 示例问候工具
 * 此工具为给定名称生成问候消息
 */
server.tool(
  "greeting",
  "Generate a personalized greeting",
  {
    name: z.string().describe("The name to greet"),
    formal: z.boolean().optional().describe("Whether to use formal greeting")
  },
  async ({ name, formal = false }) => {
    const greeting = formal ? "Good day" : "Hello";
    return {
      content: [
        {
          type: "text",
          text: `${greeting}, ${name}!`
        }
      ]
    };
  }
);

/**
 * 示例回声工具
 * 此工具简单地回显输入消息
 */
server.tool(
  "echo",
  "回显提供的消息",
  {
    message: z.string().describe("要回显的消息")
  },
  async ({ message }) => {
    return {
      content: [
        {
          type: "text",
          text: `Echo: ${message}`
        }
      ]
    };
  }
);

// 注册计算器工具
registerCalculatorTools(server);

// 注册信息资源
registerInfoResources(server);

/**
 * 使用stdio传输启动服务器
 */
async function main() {
  console.error("Starting MCP server...");
  
  const transport = new StdioServerTransport();
  
  try {
    // 将服务器连接到传输
    await server.connect(transport);
    console.error("MCP服务器在stdio上运行");
  } catch (error) {
    console.error("启动MCP服务器时出错:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
}); 