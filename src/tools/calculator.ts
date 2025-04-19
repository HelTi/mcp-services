import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Registers calculator tools with the MCP server
 * @param server - The MCP server instance
 */
export function registerCalculatorTools(server: McpServer): void {
  // Basic calculator tool
  server.tool(
    "calculate",
    "Perform basic arithmetic operations",
    {
      operation: z.enum(["add", "subtract", "multiply", "divide"]).describe("The arithmetic operation to perform"),
      a: z.number().describe("First number"),
      b: z.number().describe("Second number")
    },
    async ({ operation, a, b }) => {
      let result: number;
      
      switch (operation) {
        case "add":
          result = a + b;
          break;
        case "subtract":
          result = a - b;
          break;
        case "multiply":
          result = a * b;
          break;
        case "divide":
          if (b === 0) {
            return {
              content: [
                {
                  type: "text",
                  text: "Error: Division by zero is not allowed."
                }
              ],
              isError: true
            };
          }
          result = a / b;
          break;
        default:
          return {
            content: [
              {
                type: "text", 
                text: `Error: Unknown operation '${operation}'.`
              }
            ],
            isError: true
          };
      }
      
      return {
        content: [
          {
            type: "text",
            text: `${a} ${getOperationSymbol(operation)} ${b} = ${result}`
          }
        ]
      };
    }
  );
}

/**
 * Gets the symbol for an arithmetic operation
 * @param operation - The operation name
 * @returns The operation symbol
 */
function getOperationSymbol(operation: string): string {
  switch (operation) {
    case "add": return "+";
    case "subtract": return "-";
    case "multiply": return "×";
    case "divide": return "÷";
    default: return operation;
  }
} 