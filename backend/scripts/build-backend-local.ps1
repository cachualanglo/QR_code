# PowerShell wrapper to build backend locally with verbose logging
$ErrorActionPreference = "Stop"
Write-Host "Building backend locally (GPS TLS + tests) ..."
$mvn = "mvn -Dorg.slf4j.simpleLogger.defaultLogLevel=DEBUG -DskipTests=false package"
Write-Host "Running: $mvn"
Invoke-Expression $mvn
