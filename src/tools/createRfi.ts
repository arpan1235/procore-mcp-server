import { BaseTool, ToolDefinition, ToolResult, ToolError } from "./base";
import { procoreApiRequest } from "../utils";

export class CreateRfiTool extends BaseTool {
  getDefinition(): ToolDefinition {
    return {
      name: "createRfi",
      description: "Create a new RFI (Request for Information) in a specific project in Procore",
      inputSchema: {
        type: "object",
        properties: {
          project_id: {
            type: "string",
            description: "The ID of the project to create the RFI in"
          },
          subject: {
            type: "string",
            description: "The subject/title of the RFI"
          },
          question: {
            type: "string",
            description: "The main question or content of the RFI"
          },
          assignee_id: {
            type: "string",
            description: "The ID of the user to assign the RFI to"
          },
          rfi_manager_id: {
            type: "string",
            description: "The ID of the RFI manager"
          },
          due_date: {
            type: "string",
            description: "Due date for the RFI response (YYYY-MM-DD format)",
            format: "date"
          },
          location_id: {
            type: "string",
            description: "Optional location ID for the RFI"
          },
          trade_id: {
            type: "string", 
            description: "Optional trade ID for the RFI"
          },
          cost_code_id: {
            type: "string",
            description: "Optional cost code ID for the RFI"
          }
        },
        required: ["project_id", "subject", "question", "assignee_id", "rfi_manager_id", "due_date"]
      }
    };
  }

  async execute(params?: any): Promise<ToolResult | ToolError> {
    try {
      const { 
        project_id, 
        subject, 
        question, 
        assignee_id, 
        rfi_manager_id,
        due_date,
        location_id,
        trade_id,
        cost_code_id 
      } = params || {};
      
      if (!project_id) {
        return {
          code: -32602,
          message: "Missing required parameter: project_id"
        };
      }

      if (!subject) {
        return {
          code: -32602,
          message: "Missing required parameter: subject"
        };
      }

      if (!question) {
        return {
          code: -32602,
          message: "Missing required parameter: question"
        };
      }

      if (!assignee_id) {
        return {
          code: -32602,
          message: "Missing required parameter: assignee_id"
        };
      }

      // Validate assignee_id is a valid number
      const assigneeIdNum = parseInt(assignee_id);
      if (isNaN(assigneeIdNum)) {
        return {
          code: -32602,
          message: "Invalid assignee_id: must be a valid number"
        };
      }

      if (!rfi_manager_id) {
        return {
          code: -32602,
          message: "Missing required parameter: rfi_manager_id"
        };
      }

      // Validate rfi_manager_id is a valid number
      const rfiManagerIdNum = parseInt(rfi_manager_id);
      if (isNaN(rfiManagerIdNum)) {
        return {
          code: -32602,
          message: "Invalid rfi_manager_id: must be a valid number"
        };
      }

      if (!due_date) {
        return {
          code: -32602,
          message: "Missing required parameter: due_date"
        };
      }

      // Build the request body according to official API docs
      const requestBody: any = {
        rfi: {
          subject: subject,
          question: {
            body: question
          },
          assignee_ids: [assigneeIdNum], // Use assignee_ids array, remove assignee_id
          rfi_manager_id: rfiManagerIdNum,
          due_date: due_date,
          draft: false // Use boolean for draft status instead of status string
        }
      };

      // Add optional parameters if provided
      if (location_id) {
        const locationIdNum = parseInt(location_id);
        if (!isNaN(locationIdNum)) {
          requestBody.rfi.location_id = locationIdNum;
        }
      }
      if (trade_id) {
        const tradeIdNum = parseInt(trade_id);
        if (!isNaN(tradeIdNum)) {
          requestBody.rfi.trade_id = tradeIdNum;
        }
      }
      if (cost_code_id) {
        const costCodeIdNum = parseInt(cost_code_id);
        if (!isNaN(costCodeIdNum)) {
          requestBody.rfi.cost_code_id = costCodeIdNum;
        }
      }

      // For debugging - show the request payload
      const debugInfo = `Request payload being sent:\n${JSON.stringify(requestBody, null, 2)}\n\n`;

      try {
        const newRfi = await procoreApiRequest(`/projects/${project_id}/rfis?run_configurable_validations=true`, this.context, {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });

        return {
          content: [
            {
              type: "text" as const,
              text: `${debugInfo}RFI created successfully:\n${JSON.stringify(newRfi, null, 2)}`,
            },
          ],
        };
      } catch (apiError) {
        return {
          content: [
            {
              type: "text" as const,
              text: `${debugInfo}Error creating RFI: ${apiError instanceof Error ? apiError.message : String(apiError)}`,
            },
          ],
          isError: true,
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error creating RFI: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
} 