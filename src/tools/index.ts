import { BaseTool } from "./base";
import { GetCompaniesTool } from "./getCompanies";
import { GetProjectsTool } from "./getProjects";
import { GetRfisTool } from "./getRfis";
import { CreateRfiTool } from "./createRfi";
import { GetCompanyPeopleTool } from "./getCompanyPeople";
import { GetProjectUsersTool } from "./getProjectUsers";
import { ProcoreContext } from "../utils";

// Export base types
export * from "./base";

// Registry of all available tools
export const AVAILABLE_TOOLS = [
  GetCompaniesTool,
  GetProjectsTool,
  GetRfisTool,
  CreateRfiTool,
  GetCompanyPeopleTool,
  GetProjectUsersTool,
] as const;

// Tool factory function
export function createToolInstances(context: ProcoreContext): BaseTool[] {
  return AVAILABLE_TOOLS.map(ToolClass => new ToolClass(context));
}

// Helper function to get tool by name
export function getToolByName(tools: BaseTool[], name: string): BaseTool | undefined {
  return tools.find(tool => tool.getDefinition().name === name);
} 