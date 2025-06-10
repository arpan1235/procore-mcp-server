# Analyze Procore API Endpoints
Write-Host "Analyzing Procore API endpoints..." -ForegroundColor Green

# Read the OpenAPI specification file
$content = Get-Content rest_OAS_all.json -Raw

# Extract all API endpoints
$matches = [regex]::Matches($content, '"/rest/v1\.0/[^"]*"')
$endpoints = $matches.Value | ForEach-Object { $_.Trim('"') } | Sort-Object | Get-Unique

Write-Host "Total endpoints found: $($endpoints.Count)" -ForegroundColor Yellow

# Categorize endpoints by functional area
$categories = @{}

foreach ($endpoint in $endpoints) {
    $path = $endpoint -replace '/rest/v1\.0/', ''
    $parts = $path -split '/'
    
    # Determine category based on first path segment or pattern
    $category = switch -Regex ($path) {
        '^companies/' { 'Companies' }
        '^projects/' { 'Projects' }
        '^bim_' { 'BIM' }
        '^budget_' { 'Budget' }
        '^change_' { 'Change Management' }
        '^checklist/' { 'Checklists' }
        '^commitments' { 'Commitments' }
        '^correspondence' { 'Correspondence' }
        '^cost_codes' { 'Cost Codes' }
        '^daily_logs' { 'Daily Logs' }
        '^drawings' { 'Drawings' }
        '^documents' { 'Documents' }
        '^forms' { 'Forms' }
        '^incidents' { 'Incidents' }
        '^observations' { 'Observations' }
        '^photos' { 'Photos' }
        '^punch_items' { 'Punch Lists' }
        '^rfis' { 'RFIs' }
        '^submittals' { 'Submittals' }
        '^timecard' { 'Time Tracking' }
        '^timesheets' { 'Timesheets' }
        '^todos' { 'Todos' }
        '^users' { 'Users' }
        '^vendors' { 'Vendors' }
        '^weather' { 'Weather Logs' }
        '^webhooks' { 'Webhooks' }
        '^work_' { 'Work Management' }
        '^meetings' { 'Meetings' }
        '^me$' { 'User Profile' }
        default { 
            # Try to get category from first meaningful part
            if ($parts.Length -gt 0) {
                $firstPart = $parts[0]
                if ($firstPart -match '^\{.*\}$') {
                    if ($parts.Length -gt 1) { $parts[1] } else { 'Other' }
                } else {
                    $firstPart
                }
            } else {
                'Other'
            }
        }
    }
    
    if (-not $categories.ContainsKey($category)) {
        $categories[$category] = @()
    }
    $categories[$category] += $endpoint
}

# Output categorized results
Write-Host "`nEndpoints by Category:" -ForegroundColor Cyan
foreach ($category in $categories.Keys | Sort-Object) {
    Write-Host "`n$category ($($categories[$category].Count) endpoints):" -ForegroundColor Yellow
    $categories[$category] | ForEach-Object { Write-Host "  $_" }
}

# Output summary for tool creation
Write-Host "`n=== SUMMARY FOR MCP TOOL CREATION ===" -ForegroundColor Green
Write-Host "Major functional areas identified:"
foreach ($category in $categories.Keys | Sort-Object) {
    $count = $categories[$category].Count
    if ($count -gt 2) {  # Only show categories with multiple endpoints
        Write-Host "$category`: $count endpoints" -ForegroundColor White
    }
}

# Save results to file
$output = @"
Procore API Endpoint Analysis
Generated: $(Get-Date)
Total Endpoints: $($endpoints.Count)

Categories:
"@

foreach ($category in $categories.Keys | Sort-Object) {
    $output += "`n`n$category ($($categories[$category].Count)):`n"
    $output += ($categories[$category] | ForEach-Object { "  $_" }) -join "`n"
}

$output | Out-File "endpoint_analysis.txt" -Encoding UTF8
Write-Host "`nAnalysis saved to endpoint_analysis.txt" -ForegroundColor Green 