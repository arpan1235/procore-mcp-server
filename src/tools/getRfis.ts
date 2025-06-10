import { BaseTool, ToolDefinition, ToolResult, ToolError } from "./base";
import { procoreApiRequest } from "../utils";

export class GetRfisTool extends BaseTool {
  getDefinition(): ToolDefinition {
    return {
      name: "getRfis",
      description: "Get RFIs (Request for Information) from a specific project in Procore",
      inputSchema: {
        type: "object",
        properties: {
          project_id: {
            type: "string",
            description: "The ID of the project to get RFIs from"
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

      const rfis = await procoreApiRequest(`/projects/${project_id}/rfis`, this.context);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(rfis, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error fetching RFIs: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
} 