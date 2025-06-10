import { BaseTool, ToolDefinition, ToolResult, ToolError } from "./base";
import { procoreApiRequest } from "../utils";

export class GetCompaniesTool extends BaseTool {
  getDefinition(): ToolDefinition {
    return {
      name: "getCompanies",
      description: "Get companies accessible to the current user from Procore",
      inputSchema: {
        type: "object",
        properties: {}
      }
    };
  }

  async execute(params?: any): Promise<ToolResult | ToolError> {
    try {
      const companies = await procoreApiRequest("/companies", this.context);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(companies, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error fetching companies: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
} 