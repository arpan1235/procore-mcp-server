/**
 * Procore API utilities for MCP server
 */

// Context for Procore API access
export type ProcoreContext = {
  bearerToken: string;
  companyId?: string;
  userId?: string;
};

/**
 * Base configuration for Procore API requests
 */
export const PROCORE_API_BASE = "https://sandbox.procore.com/rest/v1.0";

/**
 * Creates standard headers for Procore API requests
 *
 * @param {string} bearerToken - The bearer token for authentication
 * @param {string} [companyId] - Optional company ID for requests that require it
 * @returns {Record<string, string>} Headers object for fetch requests
 */
export function createProcoreHeaders(bearerToken: string, companyId?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${bearerToken}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  if (companyId) {
    headers["Procore-Company-Id"] = companyId;
  }

  return headers;
}

/**
 * Makes a request to the Procore API with proper error handling
 *
 * @param {string} endpoint - The API endpoint (relative to base URL)
 * @param {ProcoreContext} context - Authentication context
 * @param {RequestInit} [options] - Additional fetch options
 * @returns {Promise<any>} The response data
 */
export async function procoreApiRequest(
  endpoint: string,
  context: ProcoreContext,
  options: RequestInit = {}
): Promise<any> {
  const url = `${PROCORE_API_BASE}${endpoint}`;
  const headers = createProcoreHeaders(context.bearerToken, context.companyId);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Procore API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Validates a bearer token by making a request to the /me endpoint
 *
 * @param {string} bearerToken - The bearer token to validate
 * @returns {Promise<boolean>} True if token is valid, false otherwise
 */
export async function validateBearerToken(bearerToken: string): Promise<boolean> {
  try {
    await procoreApiRequest("/me", { bearerToken });
    return true;
  } catch (error) {
    return false;
  }
}
