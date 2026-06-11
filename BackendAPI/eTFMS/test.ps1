$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8080/api"

Write-Host "Registering Admin..."
$adminRes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body '{"username":"admin_user_99","password":"password123","role":"ADMIN"}'
$adminToken = $adminRes.token
Write-Host "Admin Token: $adminToken"

Write-Host "Registering Police..."
$policeRes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body '{"id":"P-99","username":"police_user_99","password":"password123","role":"POLICE_OFFICER"}'
$policeToken = $policeRes.token
Write-Host "Police Token: $policeToken"

Write-Host "Registering Driver..."
$driverRes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body '{"id":"D-99","username":"driver_user_99","password":"password123","role":"DRIVER"}'
$driverToken = $driverRes.token
Write-Host "Driver Token: $driverToken"

Write-Host "Creating Category as Admin..."
$catHeaders = @{ Authorization = "Bearer $adminToken" }
$catRes = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Post -Headers $catHeaders -ContentType "application/json" -Body '{"identifier":"SPEED_99","description":"Speeding by 10km","amount":1500.0}'
Write-Host "Created Category ID: $($catRes.id) Amount: $($catRes.amount)"

Write-Host "Creating Fine as Police..."
$fineHeaders = @{ Authorization = "Bearer $policeToken" }
$fineBody = '{
  "categoryIdentifier": "SPEED_99",
  "driverId": "D-99",
  "dueDate": "2026-12-31T23:59:59"
}'
$fineRes = Invoke-RestMethod -Uri "$baseUrl/fines" -Method Post -Headers $fineHeaders -ContentType "application/json" -Body $fineBody
Write-Host "Created Fine Reference: $($fineRes.referenceNumber) Amount: $($fineRes.amount)"

Write-Host "Driver Fetching Fines..."
$driverHeaders = @{ Authorization = "Bearer $driverToken" }
$finesList = Invoke-RestMethod -Uri "$baseUrl/fines/driver/D-99" -Method Get -Headers $driverHeaders
Write-Host "Driver Fines Count: $($finesList.Length)"

Write-Host "ALL TESTS PASSED SUCCESSFULLY!"
