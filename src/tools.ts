import { ProcoreContext } from "./utils";
import { 
  BaseTool, 
  ToolDefinition, 
  ToolResult, 
  ToolError, 
  createToolInstances, 
  getToolByName 
} from "./tools/index";

export class ProcoreTools {
  private context: ProcoreContext;
  private tools: BaseTool[];

  constructor(context: ProcoreContext) {
    this.context = context;
    this.tools = createToolInstances(context);
  }

  // Tool definitions
  getToolDefinitions(): ToolDefinition[] {
    return this.tools.map(tool => tool.getDefinition());
  }

  // Main tool execution dispatcher
  async executeTool(toolName: string, params?: any): Promise<ToolResult | ToolError> {
    const tool = getToolByName(this.tools, toolName);
    
    if (!tool) {
      return {
        code: -32601,
        message: `Unknown tool: ${toolName}`
      };
    }

    return await tool.execute(params);
  }

  // Check if a tool exists
  hasTool(toolName: string): boolean {
    return getToolByName(this.tools, toolName) !== undefined;
  }
}

// Re-export types for backward compatibility
export type { ToolDefinition, ToolResult, ToolError }; 