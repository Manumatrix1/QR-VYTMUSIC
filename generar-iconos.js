const fs = require('fs');
const { createCanvas } = require('canvas');

// Tamaños necesarios para PWA
const tamaños = [72, 96, 128, 144, 152, 192, 384, 512];

function crearIcono(tamaño) {
    const canvas = createCanvas(tamaño, tamaño);
    const ctx = canvas.getContext('2d');
    
    // Fondo gradiente azul VYT
    const gradient = ctx.createLinearGradient(0, 0, tamaño, tamaño);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(1, '#3b82f6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, tamaño, tamaño);
    
    // Círculo central
    const centerX = tamaño / 2;
    const centerY = tamaño / 2;
    const radius = tamaño * 0.35;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    
    // Borde del círculo
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(30, 58, 138, 0.3)';
    ctx.lineWidth = tamaño * 0.01;
    ctx.stroke();
    
    // Texto VYT
    ctx.fillStyle = '#1e3a8a';
    ctx.font = `bold ${tamaño * 0.12}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VYT', centerX, centerY - tamaño * 0.05);
    
    // Texto MUSIC
    ctx.font = `${tamaño * 0.08}px Arial`;
    ctx.fillText('MUSIC', centerX, centerY + tamaño * 0.08);
    
    // Notas musicales decorativas
    ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.font = `${tamaño * 0.15}px Arial`;
    
    // Nota izquierda superior
    ctx.fillText('♪', centerX - radius * 0.7, centerY - radius * 0.5);
    // Nota derecha inferior
    ctx.fillText('♫', centerX + radius * 0.7, centerY + radius * 0.5);
    
    return canvas.toBuffer('image/png');
}

// Generar todos los iconos
tamaños.forEach(tamaño => {
    const buffer = crearIcono(tamaño);
    const filename = `./imagenes/logo-${tamaño}x${tamaño}.png`;
    
    fs.writeFileSync(filename, buffer);
    console.log(`✅ Creado: ${filename}`);
});

console.log('🎯 Todos los iconos creados exitosamente!');