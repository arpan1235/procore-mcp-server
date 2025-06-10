import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { ProcoreContext, procoreApiRequest, validateBearerToken } from "./utils";
import { ProcoreTools, ToolResult, ToolError } from "./tools";

// Extend Hono's context type to include our custom variables
type Variables = {
  bearerToken: string;
  companyId?: string;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Hardcoded Procore token (replace with your actual token)
const HARDCODED_PROCORE_TOKEN = "eyJhbGciOiJFUzUxMiJ9.eyJhbXIiOltdLCJhaWQiOiJVbmRybWU5WHV0Uy1iSmtoQS1ubm1kLTVYVzBKaUZ6SEh2TkI5Nm55RmU4IiwiYW91aWQiOm51bGwsImFvdXVpZCI6bnVsbCwiZXhwIjoxNzQ5NTk1NzU3LCJzaWF0IjpudWxsLCJ1aWQiOjEzNjc3MiwidXVpZCI6IjJiY2NhMThkLWU5YjQtNGFkMy05YjdkLTVlMDZhYjYzZmU3ZSIsImxhc3RfbWZhX2NoZWNrIjoxNzQ5NTkwMzU3fQ.AXjihkQ5dY8WVRvet9HPaIbaRM7NSI_toYh9U43aMy8DUjyYtA8Rkiqn2ezJTktAE-PxGRqNCkj_2dtdgmqiYYNeAHR_88HRa3SjlcG3RCGX4L3bw-hhVTvtTAnnHH2CdfmA1T15-KWRACikpXhRGL2jRl9Dw_cqKc81hPRLzlfxtiVa";
const HARDCODED_COMPANY_ID = undefined; // Set this if you want to target a specific company

// Add CORS middleware to allow browser-based clients
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Procore-Company-Id"],
  exposeHeaders: ["Content-Type"],
  credentials: false,
}));

export class ProcoreMCP {
  server = new McpServer({
    name: "Procore MCP Server",
    version: "1.0.0",
  });

  private tools: ProcoreTools;

  constructor(context: ProcoreContext) {
    this.tools = new ProcoreTools(context);
  }

  async init() {
    // Register all tools dynamically
    const toolDefinitions = this.tools.getToolDefinitions();
    
    for (const toolDef of toolDefinitions) {
      this.server.tool(toolDef.name, toolDef.description, {}, async () => {
        const result = await this.tools.executeTool(toolDef.name);
        
        // Handle tool errors - convert to standard MCP format
        if ('code' in result) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: ${result.message}`,
              },
            ],
            isError: true,
          };
        }
        
        return result;
      });
    }

    return this.server;
  }
}

// Health check endpoint (before auth middleware)
app.get("/health", (c) => {
  return c.json({ status: "healthy", service: "Procore MCP Server" });
});

// Public MCP discovery endpoint (no auth required)
app.get("/mcp", async (c) => {
  // Create a temporary tools instance to get tool definitions
  const tempTools = new ProcoreTools({ bearerToken: "", companyId: undefined });
  const toolDefinitions = tempTools.getToolDefinitions();

  return c.json({
    name: "Procore MCP Server",
    version: "1.0.0",
    description: "MCP server for Procore API integration",
    tools: toolDefinitions,
    transport: "http",
    endpoint: "https://procore-mcp-server.arpan-1c3.workers.dev/mcp/rpc",
    authRequired: false
  });
});

// Public RPC discovery endpoint (no auth required for GET)  
app.get("/mcp/rpc", async (c) => {
  return c.json({
    message: "MCP JSON-RPC endpoint",
    description: "This endpoint accepts POST requests with JSON-RPC 2.0 formatted messages",
    usage: "POST with Content-Type: application/json and Authorization: Bearer <token>",
    authRequired: true,
    example: {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {}
    }
  });
});

// No authentication middleware needed - using hardcoded token

// Protected auth middleware for other MCP endpoints that need it
app.use("/mcp/test", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header. Expected: 'Bearer <token>'" }, 401);
  }

  const bearerToken = authHeader.substring(7);
  if (!bearerToken) {
    return c.json({ error: "Invalid bearer token format" }, 401);
  }

  // Validate the token
  const isValid = await validateBearerToken(bearerToken);
  if (!isValid) {
    return c.json({ error: "Invalid or expired bearer token" }, 401);
  }

  // Store the token and company ID for use in the MCP instance
  c.set("bearerToken", bearerToken);
  c.set("companyId", c.req.header("Procore-Company-Id"));
  await next();
});

// MCP JSON-RPC endpoint
app.post("/mcp/rpc", async (c) => {
  let request: any = null;
  
  try {
    // Use hardcoded token instead of getting from headers
    const bearerToken = HARDCODED_PROCORE_TOKEN;
    const companyId = HARDCODED_COMPANY_ID;
    
    const tools = new ProcoreTools({
      bearerToken,
      companyId,
    });

    request = await c.req.json();

    // Handle initialize method
    if (request.method === "initialize") {
      return c.json({
        jsonrpc: "2.0",
        id: request.id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: "Procore MCP Server",
            version: "1.0.0"
          }
        }
      });
    }

    // Handle initialized notification
    if (request.method === "notifications/initialized") {
      // No response needed for notifications
      return new Response("", { status: 204 });
    }

    // Handle JSON-RPC request
    if (request.method === "tools/list") {
      return c.json({
        jsonrpc: "2.0",
        id: request.id,
        result: {
          tools: tools.getToolDefinitions()
        }
      });
    }

    if (request.method === "tools/call" && request.params?.name) {
      const toolName = request.params.name;
      const toolParams = request.params.arguments || {};

      if (!tools.hasTool(toolName)) {
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: -32601,
            message: `Tool not found: ${toolName}`
          }
        });
      }

      try {
        const result = await tools.executeTool(toolName, toolParams);
        
        // Handle tool errors
        if ('code' in result) {
          return c.json({
            jsonrpc: "2.0",
            id: request.id,
            error: result
          });
        }

        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          result
        });
      } catch (error) {
        return c.json({
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: -32603,
            message: `Internal error: ${error instanceof Error ? error.message : String(error)}`
          }
        });
      }
    }

    return c.json({
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: -32601,
        message: "Method not found"
      }
    });

  } catch (error) {
    return c.json({
      jsonrpc: "2.0",
      id: request?.id || null,
      error: {
        code: -32700,
        message: "Parse error"
      }
    });
  }
});

// Simple test endpoint
app.get("/mcp/test", async (c) => {
  const tempTools = new ProcoreTools({ bearerToken: "", companyId: undefined });
  const availableTools = tempTools.getToolDefinitions().map(tool => tool.name);

  return c.json({ 
    message: "MCP endpoint ready for MCP Inspector",
    availableTools,
    mcpEndpoint: "http://localhost:8788/mcp",
    rpcEndpoint: "http://localhost:8788/mcp/rpc",
    instructions: "Use MCP Inspector to connect to this server with the Authorization header"
  });
});

export default app;
