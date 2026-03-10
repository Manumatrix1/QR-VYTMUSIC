# Script de Despliegue Automático de Firebase
# VYTMUSIC - Sistema Duplicado
# Ejecutar cuando tengas tiempo (20 minutos)

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔥 DESPLIEGUE FIREBASE - VYTMUSIC (Sistema Duplicado)" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Netlify sigue funcionando. Esto es un duplicado." -ForegroundColor Yellow
Write-Host ""

# Verificar que estamos en el directorio correcto
$currentDir = Get-Location
Write-Host "📂 Directorio: $currentDir" -ForegroundColor Gray
Write-Host ""

# ========================================
# PASO 1: Verificar Firebase CLI
# ========================================
Write-Host "🔍 PASO 1/6: Verificando Firebase CLI..." -ForegroundColor Cyan
try {
    $firebaseVersion = firebase --version 2>&1
    Write-Host "✅ Firebase CLI instalado: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instálalo con:" -ForegroundColor Yellow
    Write-Host "  npm install -g firebase-tools" -ForegroundColor White
    Write-Host ""
    Write-Host "Después ejecuta este script nuevamente." -ForegroundColor Gray
    Write-Host ""
    pause
    exit
}
Write-Host ""

# ========================================
# PASO 2: Login a Firebase
# ========================================
Write-Host "🔑 PASO 2/6: Login a Firebase..." -ForegroundColor Cyan
Write-Host "Se abrirá tu navegador para iniciar sesión..." -ForegroundColor Gray
Write-Host ""

firebase login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el login" -ForegroundColor Red
    Write-Host "Intenta nuevamente ejecutando: firebase login" -ForegroundColor Yellow
    pause
    exit
}

Write-Host "✅ Login exitoso" -ForegroundColor Green
Write-Host ""

# ========================================
# PASO 3: Instalar dependencias
# ========================================
Write-Host "📦 PASO 3/6: Instalando dependencias..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path "functions") {
    Set-Location -Path "functions"
    Write-Host "→ Ejecutando npm install..." -ForegroundColor Gray
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
        Set-Location -Path ".."
        pause
        exit
    }
    
    Set-Location -Path ".."
    Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "❌ Carpeta 'functions' no encontrada" -ForegroundColor Red
    pause
    exit
}
Write-Host ""

# ========================================
# PASO 4: Configurar token de Mercado Pago
# ========================================
Write-Host "🔑 PASO 4/6: Configurando token de Mercado Pago..." -ForegroundColor Cyan
Write-Host ""

$mpToken = "APP_USR-7575962186897913-030906-df25368a0b2e097818f4066d7ab64bdf1-192683624"

Write-Host "→ Configurando mercadopago.token..." -ForegroundColor Gray
firebase functions:config:set mercadopago.token="$mpToken"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error configurando token" -ForegroundColor Red
    pause
    exit
}

Write-Host "✅ Token configurado" -ForegroundColor Green
Write-Host ""

# ========================================
# PASO 5: Verificar configuración
# ========================================
Write-Host "🔍 PASO 5/6: Verificando configuración..." -ForegroundColor Cyan
Write-Host ""

firebase functions:config:get

Write-Host ""
Write-Host "✅ Configuración verificada" -ForegroundColor Green
Write-Host ""

# ========================================
# PASO 6: Desplegar
# ========================================
Write-Host "🚀 PASO 6/6: Desplegando a Firebase..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⏱️  Este proceso puede tardar 2-3 minutos..." -ForegroundColor Yellow
Write-Host ""

firebase deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error en el deploy" -ForegroundColor Red
    Write-Host ""
    Write-Host "Revisa los errores arriba y:" -ForegroundColor Yellow
    Write-Host "1. Verifica que el proyecto 'vyt-music' exista en Firebase Console" -ForegroundColor Gray
    Write-Host "2. Verifica que tengas permisos en el proyecto" -ForegroundColor Gray
    Write-Host "3. Intenta nuevamente con: firebase deploy" -ForegroundColor Gray
    Write-Host ""
    pause
    exit
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ ¡DEPLOY EXITOSO!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎉 Tu sistema está desplegado en Firebase" -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 URLs disponibles:" -ForegroundColor Cyan
Write-Host "   • https://vyt-music.web.app" -ForegroundColor White
Write-Host "   • https://vyt-music.firebaseapp.com" -ForegroundColor White
Write-Host ""

Write-Host "📊 Estado de tus sistemas:" -ForegroundColor Cyan
Write-Host "   ✅ Netlify: https://vytmusic.netlify.app (funcionando)" -ForegroundColor Green
Write-Host "   ✅ Firebase: https://vyt-music.web.app (funcionando)" -ForegroundColor Green
Write-Host ""

Write-Host "🧪 Probar el sistema Firebase:" -ForegroundColor Cyan
Write-Host "   1. Abre: https://vyt-music.web.app/preventa_artistas.html?eventId=test&eventName=Prueba" -ForegroundColor White
Write-Host "   2. Completa el formulario" -ForegroundColor White
Write-Host "   3. Click 'Pagar con Mercado Pago'" -ForegroundColor White
Write-Host "   4. Verifica que redirige a Mercado Pago" -ForegroundColor White
Write-Host ""

Write-Host "💡 Ventajas de tener ambos sistemas:" -ForegroundColor Yellow
Write-Host "   • Backup/Redundancia" -ForegroundColor Gray
Write-Host "   • Comparar rendimiento" -ForegroundColor Gray
Write-Host "   • Probar mejoras en uno sin afectar el otro" -ForegroundColor Gray
Write-Host "   • Decidir cuál usar después" -ForegroundColor Gray
Write-Host ""

Write-Host "📝 Ver logs en tiempo real:" -ForegroundColor Cyan
Write-Host "   firebase functions:log --only createPayment" -ForegroundColor White
Write-Host ""

Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🎊 ¡Sistema duplicado exitosamente!" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

pause
