# Script para crear favicon optimizado desde logo-movimiento.png
Add-Type -AssemblyName System.Drawing

$rutaImagen = "imagenes\logo-movimiento.png"
$rutaSalida = "imagenes\"

try {
    if (Test-Path $rutaImagen) {
        Write-Host "✅ Encontrado: $rutaImagen" -ForegroundColor Green
        
        # Cargar imagen original
        $imagenOriginal = [System.Drawing.Image]::FromFile((Resolve-Path $rutaImagen))
        Write-Host "📐 Tamaño original: $($imagenOriginal.Width)x$($imagenOriginal.Height)" -ForegroundColor Cyan
        
        # Crear favicon 16x16
        $favicon16 = New-Object System.Drawing.Bitmap(16, 16)
        $graphics16 = [System.Drawing.Graphics]::FromImage($favicon16)
        $graphics16.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics16.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics16.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics16.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        # Fondo blanco
        $graphics16.Clear([System.Drawing.Color]::White)
        $graphics16.DrawImage($imagenOriginal, 0, 0, 16, 16)
        $favicon16.Save("$rutaSalida\favicon-16x16.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $graphics16.Dispose()
        Write-Host "✅ Creado: favicon-16x16.png" -ForegroundColor Green
        
        # Crear favicon 32x32
        $favicon32 = New-Object System.Drawing.Bitmap(32, 32)
        $graphics32 = [System.Drawing.Graphics]::FromImage($favicon32)
        $graphics32.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics32.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics32.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics32.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        # Fondo blanco
        $graphics32.Clear([System.Drawing.Color]::White)
        $graphics32.DrawImage($imagenOriginal, 0, 0, 32, 32)
        $favicon32.Save("$rutaSalida\favicon-32x32.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $graphics32.Dispose()
        Write-Host "✅ Creado: favicon-32x32.png" -ForegroundColor Green
        
        # Crear favicon.ico (usando el de 32x32)
        $favicon32.Save("$rutaSalida\favicon.ico", [System.Drawing.Imaging.ImageFormat]::Icon)
        Write-Host "✅ Creado: favicon.ico" -ForegroundColor Green
        
        # Limpiar recursos
        $favicon16.Dispose()
        $favicon32.Dispose()
        $imagenOriginal.Dispose()
        
        Write-Host "`n🎉 ¡Favicons creados exitosamente!" -ForegroundColor Yellow
        Write-Host "📁 Archivos generados en: $rutaSalida" -ForegroundColor Cyan
        Write-Host "   - favicon.ico" -ForegroundColor White
        Write-Host "   - favicon-16x16.png" -ForegroundColor White
        Write-Host "   - favicon-32x32.png" -ForegroundColor White
        
    } else {
        Write-Host "❌ Error: No se encontró el archivo $rutaImagen" -ForegroundColor Red
        Write-Host "💡 Asegúrate de que el archivo logo-movimiento.png esté en la carpeta imagenes/" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error al procesar la imagen: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n⏸️  Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")