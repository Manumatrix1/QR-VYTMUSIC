# Script PowerShell para generar iconos VYT-MUSIC
Add-Type -AssemblyName System.Drawing

function CrearIcono($size) {
    # Crear bitmap
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    # Fondo azul degradado
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $colorInicio = [System.Drawing.Color]::FromArgb(30, 58, 138)    # #1e3a8a
    $colorFin = [System.Drawing.Color]::FromArgb(59, 130, 246)      # #3b82f6
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $colorInicio, $colorFin, 45)
    $graphics.FillRectangle($brush, $rect)
    
    # Circulo blanco central
    $centerX = $size / 2
    $centerY = $size / 2
    $radius = $size * 0.35
    $circulo = New-Object System.Drawing.Rectangle(($centerX - $radius), ($centerY - $radius), ($radius * 2), ($radius * 2))
    $brushBlanco = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 255, 255, 255))
    $graphics.FillEllipse($brushBlanco, $circulo)
    
    # Texto VYT
    $fontVYT = New-Object System.Drawing.Font("Arial", ($size * 0.12), [System.Drawing.FontStyle]::Bold)
    $brushTexto = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 58, 138))
    $formatoTexto = New-Object System.Drawing.StringFormat
    $formatoTexto.Alignment = [System.Drawing.StringAlignment]::Center
    $formatoTexto.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $rectTextoVYT = New-Object System.Drawing.Rectangle(0, ($centerY - $size * 0.08), $size, ($size * 0.12))
    $graphics.DrawString("VYT", $fontVYT, $brushTexto, $rectTextoVYT, $formatoTexto)
    
    # Texto MUSIC
    $fontMusic = New-Object System.Drawing.Font("Arial", ($size * 0.08))
    $rectTextoMusic = New-Object System.Drawing.Rectangle(0, ($centerY + $size * 0.04), $size, ($size * 0.08))
    $graphics.DrawString("MUSIC", $fontMusic, $brushTexto, $rectTextoMusic, $formatoTexto)
    
    # Notas musicales
    $fontNotas = New-Object System.Drawing.Font("Arial", ($size * 0.12))
    $brushNotas = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 59, 130, 246))
    
    # Nota izquierda
    $rectNota1 = New-Object System.Drawing.Rectangle(($centerX - $radius * 0.9), ($centerY - $radius * 0.7), ($size * 0.2), ($size * 0.2))
    $graphics.DrawString([char]9834, $fontNotas, $brushNotas, $rectNota1, $formatoTexto)
    
    # Nota derecha
    $rectNota2 = New-Object System.Drawing.Rectangle(($centerX + $radius * 0.5), ($centerY + $radius * 0.3), ($size * 0.2), ($size * 0.2))
    $graphics.DrawString([char]9835, $fontNotas, $brushNotas, $rectNota2, $formatoTexto)
    
    return $bitmap
}

# Tamanos necesarios
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)

foreach ($size in $sizes) {
    $bitmap = CrearIcono $size
    $filename = "logo-${size}x${size}.png"
    $bitmap.Save($filename, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
    Write-Host "Creado: $filename" -ForegroundColor Green
}

Write-Host "Todos los iconos PNG creados exitosamente!" -ForegroundColor Yellow