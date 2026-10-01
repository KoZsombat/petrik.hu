<#
.SYNOPSIS
  Builds the site's Docker images on this machine and ships them to the server.

.DESCRIPTION
  See DEPLOY.md. Both images (petrikhu-server, petrikhu-client) are built here
  rather than on the server because a 1 GB EC2 instance runs out of memory
  building them, and because apps/client/public/media (271 MB, not in git)
  only exists here - it goes up inside the client image.

  The server keeps its own .env, database and uploads; a normal deploy never
  touches them. -WithData is for the first deploy only: it REPLACES the
  server's database and uploads with this machine's.

.EXAMPLE
  .\deploy.ps1 -Server 3.120.45.67 -Key C:\Users\me\.ssh\petrik.pem -Init
  .\deploy.ps1 -Server 3.120.45.67 -Key C:\Users\me\.ssh\petrik.pem
  ./deploy.ps1 -Server 3.120.45.67 -Key ~/.ssh/petrik.pem -Platform linux/arm64   # macOS (pwsh), arm64 server
#>
param(
  [Parameter(Mandatory = $true)] [string] $Server,
  [Parameter(Mandatory = $true)] [string] $Key,
  [string] $User = 'ubuntu',
  [string] $RemoteDir = 'petrik',
  # First deploy: also uploads .env.example, to be copied to .env on the server.
  [switch] $Init,
  # Replace the server's database and uploads with this machine's copy.
  [switch] $WithData,
  # The server's CPU architecture, whatever machine you deploy from. Without this
  # an Apple Silicon Mac builds arm64 images, which an amd64 EC2 instance cannot
  # run (the container crash-loops). Use linux/arm64 for a Graviton instance.
  [ValidateSet('linux/amd64', 'linux/arm64')] [string] $Platform = 'linux/amd64'
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$target = "$User@$Server"
$sshArgs = @('-i', $Key, '-o', 'StrictHostKeyChecking=accept-new')
$image = Join-Path ([System.IO.Path]::GetTempPath()) 'petrikhu-images.tar'

function Invoke-Native([string] $Label, [scriptblock] $Command) {
  Write-Host "==> $Label" -ForegroundColor Cyan
  & $Command
  if ($LASTEXITCODE -ne 0) { throw "$Label failed (exit code $LASTEXITCODE)" }
}

function Invoke-Remote([string] $Label, [string] $Script) {
  Invoke-Native $Label { ssh @sshArgs $target $Script }
}

if ($WithData) {
  $answer = Read-Host "This REPLACES the database and uploads on $Server with this machine's. Type 'yes' to continue"
  if ($answer -ne 'yes') { throw 'Cancelled.' }
}

$env:DOCKER_DEFAULT_PLATFORM = $Platform
Invoke-Native "Building the images for $Platform" { docker compose build server client }
Invoke-Native 'Saving the images' { docker save -o $image petrikhu-server petrikhu-client }

Invoke-Remote 'Preparing the server folder' "mkdir -p ~/$RemoteDir/apps/server/data/db ~/$RemoteDir/apps/server/uploads"

$files = @($image, 'docker-compose.yml')
if ($Init) { $files += '.env.example' }
Invoke-Native 'Uploading (this takes a while the first time)' { scp @sshArgs -C $files "${target}:$RemoteDir/" }
Remove-Item $image

if ($WithData) {
  # A consistent SQLite copy needs both sides stopped.
  Invoke-Native 'Stopping the local server container' { docker compose stop server }
  Invoke-Remote 'Stopping the server container' "cd ~/$RemoteDir && (docker compose stop server || true) && sudo chown -R `$USER apps"
  Invoke-Native 'Uploading the database' { scp @sshArgs -C -r 'apps/server/data/db' "${target}:$RemoteDir/apps/server/data/" }
  Invoke-Native 'Uploading the uploads' { scp @sshArgs -C -r 'apps/server/uploads' "${target}:$RemoteDir/apps/server/" }
  Invoke-Native 'Restarting the local server container' { docker compose start server }
}

$start = @(
  "cd ~/$RemoteDir",
  'docker load -i petrikhu-images.tar',
  'rm petrikhu-images.tar',
  'if [ ! -f .env ]; then echo ".env is missing on the server - see DEPLOY.md step 5, then run: docker compose up -d --no-build --remove-orphans"; exit 3; fi',
  # --remove-orphans: the pre-split single `app` container, on servers deployed before.
  'docker compose up -d --no-build --remove-orphans',
  'docker image prune -f >/dev/null',
  'docker compose ps'
) -join ' && '
Invoke-Remote 'Starting the new version on the server' $start

Write-Host 'Deployed.' -ForegroundColor Green
