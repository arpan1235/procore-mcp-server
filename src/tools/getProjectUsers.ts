import { BaseTool, ToolDefinition, ToolResult, ToolError } from "./base";
import { procoreApiRequest } from "../utils";

export class GetProjectUsersTool extends BaseTool {
  getDefinition(): ToolDefinition {
    return {
      name: "getProjectUsers",
      description: "Get users from a specific project in Procore (useful for finding valid assignee IDs for RFIs)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: {
            type: "string",
            description: "The ID of the project to get users from"
          }
        },
        required: ["project_id"]
      }
    };
  }

  async execute(params?: any): Promise<ToolResult | ToolError> {
    try {
      const { project_id } = params || {};
      
      if (!project_id) {
        return {
          code: -32602,
          message: "Missing required parameter: project_id"
        };
      }

      const users = await procoreApiRequest(`/projects/${project_id}/users`, this.context);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(users, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error fetching project users: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
} 