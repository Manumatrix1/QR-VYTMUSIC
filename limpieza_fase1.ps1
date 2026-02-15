# Script de Limpieza Fase 1 - VYTMUSIC
# Ejecutar desde la carpeta raíz del proyecto
# PowerShell 5.1+

Write-Host "🚀 VYTMUSIC - Script de Limpieza Fase 1" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar ubicación
$currentPath = Get-Location
Write-Host "📍 Ubicación actual: $currentPath" -ForegroundColor Yellow
Write-Host ""

# Confirmar ejecución
Write-Host "⚠️  ADVERTENCIA: Este script realizará los siguientes cambios:" -ForegroundColor Red
Write-Host "   1. Comprimirá y moverá la carpeta BACKUP fuera del proyecto"
Write-Host "   2. Eliminará archivos DEBUG"
Write-Host "   3. Renombrará archivos duplicados como _OLD"
Write-Host ""

$confirm = Read-Host "¿Deseas continuar? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "❌ Operación cancelada por el usuario" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "✅ Iniciando limpieza..." -ForegroundColor Green
Write-Host ""

# ========================================
# PASO 1: Crear carpeta de backups externa
# ========================================
Write-Host "📦 Paso 1: Creando carpeta de backups externa..." -ForegroundColor Cyan

$backupFolder = "../VYTMUSIC_BACKUPS"
if (!(Test-Path $backupFolder)) {
    New-Item -ItemType Directory -Path $backupFolder | Out-Null
    Write-Host "   ✓ Carpeta de backups creada: $backupFolder" -ForegroundColor Green
} else {
    Write-Host "   ✓ Carpeta de backups ya existe" -ForegroundColor Green
}

# ========================================
# PASO 2: Comprimir y mover carpeta BACKUP interna
# ========================================
Write-Host ""
Write-Host "📦 Paso 2: Comprimiendo y moviendo carpeta BACKUP..." -ForegroundColor Cyan

$backupPath = "QR-VYTMUSIC-BACKUP-2025-10-07-13-41"
if (Test-Path $backupPath) {
    Write-Host "   → Comprimiendo $backupPath..." -ForegroundColor Yellow
    
    $timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
    $zipName = "BACKUP-2025-10-07-$timestamp.zip"
    $zipPath = Join-Path $backupFolder $zipName
    
    try {
        Compress-Archive -Path $backupPath -DestinationPath $zipPath -Force
        Write-Host "   ✓ Comprimido exitosamente: $zipName" -ForegroundColor Green
        
        Write-Host "   → Eliminando carpeta original..." -ForegroundColor Yellow
        Remove-Item -Path $backupPath -Recurse -Force
        Write-Host "   ✓ Carpeta BACKUP eliminada del proyecto" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Error al comprimir/eliminar: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️  Carpeta BACKUP no encontrada (puede que ya se haya eliminado)" -ForegroundColor Yellow
}

# ========================================
# PASO 3: Eliminar archivos DEBUG
# ========================================
Write-Host ""
Write-Host "🗑️  Paso 3: Eliminando archivos DEBUG..." -ForegroundColor Cyan

$debugFiles = @(
    "QR-VYTMUSIC\gestion_votacion_DEBUG.html"
)

foreach ($file in $debugFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "   ✓ Eliminado: $file" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  No encontrado: $file" -ForegroundColor Yellow
    }
}

# ========================================
# PASO 4: Renombrar archivos duplicados
# ========================================
Write-Host ""
Write-Host "📝 Paso 4: Renombrando archivos duplicados como _OLD..." -ForegroundColor Cyan

# Renombrar index.html en raíz
if (Test-Path "index.html") {
    Rename-Item "index.html" "index_PORTAL_COMPLETO_OLD.html" -Force
    Write-Host "   ✓ Renombrado: index.html → index_PORTAL_COMPLETO_OLD.html" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No encontrado: index.html (raíz)" -ForegroundColor Yellow
}

# Renombrar archivos en QR-VYTMUSIC
Set-Location "QR-VYTMUSIC"

$filesToRename = @(
    @{Old="escaner_qr_mejorado.html"; New="escaner_qr_mejorado_OLD.html"},
    @{Old="escaner_inteligente_integrado.html"; New="escaner_inteligente_OLD.html"}
)

foreach ($file in $filesToRename) {
    if (Test-Path $file.Old) {
        Rename-Item $file.Old $file.New -Force
        Write-Host "   ✓ Renombrado: $($file.Old) → $($file.New)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  No encontrado: $($file.Old)" -ForegroundColor Yellow
    }
}

Set-Location ..

# ========================================
# RESUMEN
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ LIMPIEZA FASE 1 COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Resumen de cambios:" -ForegroundColor Yellow
Write-Host "   • Carpeta BACKUP comprimida y movida a: $backupFolder"
Write-Host "   • Archivos DEBUG eliminados"
Write-Host "   • Archivos duplicados renombrados con sufijo _OLD"
Write-Host ""
Write-Host "📌 Siguiente paso:" -ForegroundColor Cyan
Write-Host "   Revisar que todo funcione correctamente antes de continuar con Fase 2"
Write-Host ""
Write-Host "💡 Consejo:" -ForegroundColor Yellow
Write-Host "   Prueba abrir QR-VYTMUSIC/index.html y verificar que el login funciona"
Write-Host ""

# Pausar para ver resultados
Read-Host "Presiona ENTER para cerrar"
