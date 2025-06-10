import { ProcoreContext } from "../utils";

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolResult {
  [x: string]: unknown;
  content: Array<{
    type: "text";
    text: string;
  }>;
  _meta?: Record<string, unknown>;
  isError?: boolean;
}

export interface ToolError {
  code: number;
  message: string;
}

export abstract class BaseTool {
  protected context: ProcoreContext;

  constructor(context: ProcoreContext) {
    this.context = context;
  }

  abstract getDefinition(): ToolDefinition;
  abstract execute(params?: any): Promise<ToolResult | ToolError>;
} 