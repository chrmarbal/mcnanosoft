# Desactivar restricciones de ejecución de scripts de PowerShell
Set-ExecutionPolicy Bypass -Scope Process -Force

# Instalar Chocolatey
Write-Host "Instalando Chocolatey..."
[System.Net.ServicePointManager]::SecurityProtocol = 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
Write-Host "Chocolatey instalado correctamente."

# Recargar PATH para usar Chocolatey inmediatamente
$env:Path += ";$($env:ProgramData)\chocolatey\bin"

# Instalar mkcert con Chocolatey
Write-Host "Instalando mkcert..."
choco install mkcert -y
Write-Host "mkcert instalado correctamente."

# Instalar la CA local de mkcert
Write-Host "Configurando mkcert..."
mkcert -install
Write-Host "Autoridad de Certificación instalada."

# Definir rutas de carpetas en Backend y Frontend
$backendCertFolder = "$PSScriptRoot\..\certs"
$frontendCertFolder = "$PSScriptRoot\..\..\Frontend\certs"

# Crear carpetas certs si no existen
foreach ($folder in @($backendCertFolder, $frontendCertFolder)) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder
    }
}

# Generar certificados HTTPS en Backend
Write-Host "Generando certificados HTTPS..."
mkcert -key-file "$backendCertFolder\private.key" -cert-file "$backendCertFolder\cert.crt" localhost
Write-Host "Certificados generados en: $backendCertFolder"

# Copiar certificados al Frontend
Write-Host "Copiando certificados al Frontend..."
Copy-Item -Path "$backendCertFolder\private.key" -Destination "$frontendCertFolder\private.key" -Force
Copy-Item -Path "$backendCertFolder\cert.crt" -Destination "$frontendCertFolder\cert.crt" -Force
Write-Host "Certificados copiados a: $frontendCertFolder"

Write-Host "✅ Proceso completado. ¡Chocolatey, mkcert y certificados HTTPS instalados correctamente!"