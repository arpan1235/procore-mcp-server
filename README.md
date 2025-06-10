# Procore MCP Server

A Model Context Protocol (MCP) server that provides integration with the Procore API, built for Cloudflare Workers.

## Overview

This MCP server allows AI assistants to interact with Procore's construction management platform through a standardized interface. It provides tools for accessing projects, submittals, RFIs, and other Procore resources.

## Prerequisites

- Node.js 18+ 
- [Cloudflare Workers account](https://workers.cloudflare.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed
- Procore developer account and API access

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd procore-mcp-server
npm install
```

### 2. Get Procore API Credentials

#### Create a Procore Developer Account
1. Visit the [Procore Developer Portal](https://developers.procore.com/)
2. Sign up for a developer account or log in
3. Navigate to **My Apps** in the developer portal

#### Create an Application
1. Click **Create New App**
2. Fill in your application details:
   - **App Name**: Your MCP server name
   - **Description**: Brief description of your integration
   - **Redirect URI**: `https://your-domain.com/callback` (can be localhost for development)
3. Select the required **Scopes** (permissions):
   - `read_projects` - Read project information
   - `read_submittals` - Read submittal data
   - `read_rfis` - Read RFI data
   - Add other scopes as needed
4. Click **Create App**

#### Get Your Credentials
After creating the app, you'll see:
- **Client ID** - Your application identifier
- **Client Secret** - Your application secret (keep this secure!)

#### Generate an Access Token

**Option 1: OAuth 2.0 Flow (Recommended for production)**
1. Implement the OAuth flow to get user authorization
2. Exchange authorization code for access token
3. Use refresh token to maintain access

**Option 2: Personal Access Token (For development/testing)**
1. In the Procore web app, go to your **Account Settings**
2. Navigate to **Developer Tools** → **Personal Access Tokens**
3. Click **Create Token**
4. Set the token name and select scopes
5. Copy the generated token (this is your `PROCORE_TOKEN`)

> **Note**: Personal Access Tokens are tied to your user account and inherit your permissions. For production applications, use OAuth 2.0 flow.

### 3. Configure Environment Variables

Set your Procore API token as a Cloudflare Workers secret:

```bash
# Using Wrangler CLI (recommended)
wrangler secret put PROCORE_TOKEN
# Paste your token when prompted
```

Or via the Cloudflare Dashboard:
1. Go to your Worker → **Settings** → **Environment Variables**
2. Add variable: `PROCORE_TOKEN` (mark as Secret)
3. Paste your token value
4. Click **Save**

### 4. Deploy to Cloudflare Workers

```bash
# Deploy to Cloudflare Workers
wrangler deploy
```

Your MCP server will be available at: `https://your-worker-name.your-subdomain.workers.dev`

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### MCP Discovery
```
GET /mcp
```
Returns MCP server capabilities and available tools.

### MCP JSON-RPC
```
POST /mcp/rpc
```
Main MCP endpoint for tool execution. Accepts JSON-RPC 2.0 formatted requests.

## Usage

### With MCP Inspector
1. Install [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
2. Connect to your server endpoint: `https://your-worker-name.your-subdomain.workers.dev/mcp/rpc`

### Direct API Usage

#### Initialize the connection
```json
POST /mcp/rpc
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {}
}
```

#### List available tools
```json
POST /mcp/rpc
{
  "jsonrpc": "2.0",
  "id": 2,  
  "method": "tools/list",
  "params": {}
}
```

#### Execute a tool
```json
POST /mcp/rpc
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "get_projects",
    "arguments": {}
  }
}
```

## Available Tools

The server provides various tools for interacting with Procore:

- **get_projects** - Retrieve project listings
- **get_submittals** - Access submittal data
- **get_rfis** - Retrieve RFI information
- And more (see `/mcp` endpoint for full list)

## Development

### Local Development
```bash
# Start local development server
wrangler dev

# The server will be available at http://localhost:8787
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PROCORE_TOKEN` | Procore API access token | Yes |

## Security Considerations

- **Never commit API tokens** to version control
- Use Cloudflare Workers secrets for sensitive data
- Implement proper error handling to avoid token leakage
- Consider implementing rate limiting for production use
- Use OAuth 2.0 flow for production applications

## Troubleshooting

### "PROCORE_TOKEN environment variable is not set"
- Ensure you've set the secret using `wrangler secret put PROCORE_TOKEN`
- Verify the secret exists in your Cloudflare Workers dashboard

### "Invalid or expired bearer token"
- Check that your Procore token is still valid
- Personal Access Tokens may expire - regenerate if needed
- Ensure your token has the required scopes/permissions

### API Permission Errors
- Verify your Procore app has the necessary scopes
- Check that your user account has access to the requested resources
- Ensure you're accessing projects you have permissions for

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license information here]

## Support

- [Procore API Documentation](https://developers.procore.com/documentation)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [MCP Specification](https://spec.modelcontextprotocol.io/) 