import { BaseTool, ToolDefinition, ToolResult, ToolError } from "./base";
import { procoreApiRequest } from "../utils";

export class GetProjectsTool extends BaseTool {
  getDefinition(): ToolDefinition {
    return {
      name: "getProjects",
      description: "Get projects from a specific company in Procore",
      inputSchema: {
        type: "object",
        properties: {
          company_id: {
            type: "string",
            description: "The ID of the company to get projects from"
          }
        },
        required: ["company_id"]
      }
    };
  }

  async execute(params?: any): Promise<ToolResult | ToolError> {
    try {
      const { company_id } = params || {};
      
      if (!company_id) {
        return {
          code: -32602,
          message: "Missing required parameter: company_id"
        };
      }

      const projects = await procoreApiRequest(`/companies/${company_id}/projects`, this.context);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(projects, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error fetching projects: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
} 