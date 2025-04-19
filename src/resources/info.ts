import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Registers information resources with the MCP server
 * @param server - The MCP server instance
 */
export function registerInfoResources(server: McpServer): void {
  // System information resource (static)
  server.resource(
    "system-info",
    "system://info",
    async (uri) => {
      const info = {
        platform: process.platform,
        nodeVersion: process.version,
        serverName: "mcp-service",
        serverVersion: "1.0.0",
        timestamp: new Date().toISOString(),
      };
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(info, null, 2)
        }]
      };
    }
  );
  
  // Dynamic information resource with parameter
  server.resource(
    "user-info",
    new ResourceTemplate("user://{username}/info", { list: undefined }),
    async (uri, { username }) => {
      // In a real application, you might fetch user data from a database
      const userInfo = {
        username,
        accessLevel: username === "admin" ? "administrator" : "user",
        lastLogin: new Date().toISOString(),
      };
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(userInfo, null, 2)
        }]
      };
    }
  );
} 