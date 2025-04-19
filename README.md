# MCP Service

A TypeScript implementation of a Model Context Protocol (MCP) service. This service provides tools and resources that can be used by LLM clients.

## Overview

The Model Context Protocol is a standardized way for applications to provide context for LLMs. This server implements the MCP protocol, offering tools and resources that can be used by MCP-compatible clients like Claude for Desktop.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

### Build and Run

Build the TypeScript code:

```bash
npm run build
```

Run the MCP server:

```bash
npm start
```

For development with automatic rebuilding:

```bash
npm run dev
```

## Available Tools

The server currently provides the following tools:

### 1. Greeting Tool

Generates a personalized greeting for a given name.

**Parameters:**
- `name` (string): The name to greet
- `formal` (boolean, optional): Whether to use a formal greeting style

### 2. Echo Tool

Echoes back the provided message.

**Parameters:**
- `message` (string): The message to echo back

### 3. Calculator

Performs basic arithmetic operations.

**Parameters:**
- `operation` (enum: "add", "subtract", "multiply", "divide"): The arithmetic operation to perform
- `a` (number): First number
- `b` (number): Second number

## Available Resources

The server provides the following resources for LLM context:

### 1. System Information

Provides basic system and server information.

**URI:** `system://info`

### 2. User Information

Provides information about a specific user.

**URI Template:** `user://{username}/info`

## Using with Claude for Desktop

1. Open Claude for Desktop
2. Configure Claude to use this MCP server by editing your configuration file:

```json
{
  "mcpServers": {
    "mcp-service": {
      "command": "node",
      "args": [
        "/absolute/path/to/this/repo/build/index.js"
      ]
    }
  }
}
```

3. Restart Claude for Desktop
4. The MCP server tools and resources should now be available to use in Claude

## Extending

### Adding New Tools

To add new tools to the server, modify the `src/index.ts` file or create new tool modules in the `src/tools` directory.

Example of adding a new tool:

```typescript
server.tool(
  "toolName",
  "Tool description",
  {
    param1: z.string().describe("Parameter description"),
    param2: z.number().describe("Another parameter description")
  },
  async ({ param1, param2 }) => {
    // Tool implementation logic here
    return {
      content: [
        {
          type: "text",
          text: `Result: ${param1}, ${param2}`
        }
      ]
    };
  }
);
```

### Adding New Resources

To add new resources, create modules in the `src/resources` directory:

```typescript
// Static resource
server.resource(
  "resource-name",
  "resource://identifier",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: "Resource content here"
    }]
  })
);

// Dynamic resource with parameters
server.resource(
  "dynamic-resource",
  new ResourceTemplate("dynamic://{param}/resource", { list: undefined }),
  async (uri, { param }) => ({
    contents: [{
      uri: uri.href,
      text: `Dynamic resource with param: ${param}`
    }]
  })
);
```

## License

MIT 