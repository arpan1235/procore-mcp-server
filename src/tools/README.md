# Procore Tools

This directory contains individual tool implementations for the Procore MCP Server.

## Architecture

Each tool is implemented as a separate file that extends the `BaseTool` abstract class. This modular approach makes it easy to add, modify, and maintain tools.

### File Structure

```
src/tools/
├── base.ts           # Base tool interface and abstract class
├── index.ts          # Tool registry and factory functions
├── getCompanies.ts   # Example: Get companies tool
├── getProjects.ts    # Example: Get projects tool
└── README.md         # This file
```

## Adding a New Tool

To add a new tool, follow these steps:

### 1. Create a new tool file

Create a new file named after your tool (e.g., `getUserProfile.ts`):

```typescript
import { BaseTool, ToolDefinition, ToolResult, ToolError } from "./base";
import { procoreApiRequest } from "../utils";

export class GetUserProfileTool extends BaseTool {
  getDefinition(): ToolDefinition {
    return {
      name: "getUserProfile",
      description: "Get the current user's profile information from Procore",
      inputSchema: {
        type: "object",
        properties: {
          // Define any required parameters here
        },
        required: [] // List required parameter names
      }
    };
  }

  async execute(params?: any): Promise<ToolResult | ToolError> {
    try {
      // Implement your tool logic here
      const result = await procoreApiRequest("/me", this.context);
      
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
}
```

### 2. Register the tool

Add your tool to the registry in `index.ts`:

```typescript
// Import your tool
import { GetUserProfileTool } from "./getUserProfile";

// Add it to the AVAILABLE_TOOLS array
export const AVAILABLE_TOOLS = [
  GetCompaniesTool,
  GetProjectsTool,
  GetUserProfileTool, // <- Add your tool here
] as const;
```

That's it! Your tool will now be automatically available in the MCP server.

## Tool Structure

### ToolDefinition

Each tool must provide a definition with:
- `name`: Unique identifier for the tool
- `description`: Human-readable description of what the tool does
- `inputSchema`: JSON Schema defining the expected parameters

### Tool Execution

The `execute` method should:
- Validate input parameters
- Make API calls using the provided `ProcoreContext`
- Return either a `ToolResult` or `ToolError`
- Handle errors gracefully

### Error Handling

Tools should return structured errors for common scenarios:
- `-32602`: Invalid params (missing required parameters)
- `-32603`: Internal error (API failures, etc.)

## Examples

See the existing tools:
- `getCompanies.ts`: Simple API call with no parameters
- `getProjects.ts`: API call with required parameters and validation

## Benefits

This modular approach provides:
- **Easy maintenance**: Each tool is self-contained
- **Type safety**: Full TypeScript support with proper interfaces
- **Automatic registration**: Tools are automatically discovered and registered
- **Consistent API**: All tools follow the same pattern
- **Error handling**: Standardized error responses 