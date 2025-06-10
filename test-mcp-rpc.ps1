# Test MCP JSON-RPC endpoint

$token = "eyJhbGciOiJFUzUxMiJ9.eyJhbXIiOltdLCJhaWQiOiJVbmRybWU5WHV0Uy1iSmtoQS1ubm1kLTVYVzBKaUZ6SEh2TkI5Nm55RmU4IiwiYW91aWQiOm51bGwsImFvdXVpZCI6bnVsbCwiZXhwIjoxNzQ5NDg3MTAwLCJzaWF0IjpudWxsLCJ1aWQiOjEzNjc3MiwidXVpZCI6IjJiY2NhMThkLWU5YjQtNGFkMy05YjdkLTVlMDZhYjYzZmU3ZSIsImxhc3RfbWZhX2NoZWNrIjoxNzQ5NDgxNzAwfQ.AXTXkVbv3GuN6yQb3MOyrFdQxtLKoHsiH1kCEr6rAHoxd9W3TQp0JoQLzQYjj_LySnO4VtHRLD3Ahw-qLcDiuC9hAEXbv85-K-MNDKPLyx2WmkxAKcrl2jk7ag5BMPPuuu_wvfBPIUcsTu8F0LEnzpxXrh5T5nh2UxraIuVyY49JeF6-"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Testing MCP JSON-RPC - List Tools..." -ForegroundColor Cyan
$listToolsRequest = @{
    jsonrpc = "2.0"
    id = 1
    method = "tools/list"
    params = @{}
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8788/mcp/rpc" -Method POST -Headers $headers -Body $listToolsRequest
    Write-Host "✅ Tools List Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error listing tools: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + "="*50
Write-Host "Testing MCP JSON-RPC - Call getCompanies..." -ForegroundColor Cyan

$callToolRequest = @{
    jsonrpc = "2.0"
    id = 2
    method = "tools/call"
    params = @{
        name = "getCompanies"
        arguments = @{}
    }
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8788/mcp/rpc" -Method POST -Headers $headers -Body $callToolRequest
    Write-Host "✅ getCompanies Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error calling getCompanies: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseText = $reader.ReadToEnd()
        Write-Host "Response body: $responseText" -ForegroundColor Yellow
    }
} 