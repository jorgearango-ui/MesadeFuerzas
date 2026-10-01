// ============================================================
// MÓDULO: TEXTURAS PROCEDURALES
// ============================================================

import * as THREE from 'three';

// ============================================================
// TEXTURA: FACHADA DE EDIFICIO (solo caras laterales)
// ============================================================
export function crearTexturaFachada(colorBase, numVentanasX, numVentanasY) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Color base
    ctx.fillStyle = colorBase;
    ctx.fillRect(0, 0, 256, 512);

    // Ruido sutil
    for (let i = 0; i < 6000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 512;
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`;
        ctx.fillRect(x, y, 1, 1);
    }

    // Líneas de pisos
    const altoPiso = 512 / numVentanasY;
    for (let j = 0; j < numVentanasY; j++) {
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, j * altoPiso);
        ctx.lineTo(256, j * altoPiso);
        ctx.stroke();
    }

    // Ventanas
    const margenX = 20;
    const anchoVentana = (256 - margenX * 2) / numVentanasX;

    for (let i = 0; i < numVentanasX; i++) {
        for (let j = 0; j < numVentanasY; j++) {
            const x = margenX + i * anchoVentana + anchoVentana * 0.15;
            const y = j * altoPiso + altoPiso * 0.2;
            const ancho = anchoVentana * 0.7;
            const alto = altoPiso * 0.6;

            // Marco
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(x - 2, y - 2, ancho + 4, alto + 4);

            // Cristal con gradiente
            const gradVentana = ctx.createLinearGradient(x, y, x + ancho, y + alto);
            gradVentana.addColorStop(0, '#87CEEB');
            gradVentana.addColorStop(0.5, '#B0E0E6');
            gradVentana.addColorStop(1, '#4682B4');
            ctx.fillStyle = gradVentana;
            ctx.fillRect(x, y, ancho, alto);

            // Reflejo del sol
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + ancho * 0.5, y);
            ctx.lineTo(x, y + alto * 0.5);
            ctx.closePath();
            ctx.fill();

            // Ventana con luz encendida ocasional
            if (Math.random() < 0.12) {
                ctx.fillStyle = 'rgba(255, 220, 150, 0.7)';
                ctx.fillRect(x, y, ancho, alto);
            }
        }
    }

    const textura = new THREE.CanvasTexture(canvas);
    textura.anisotropy = 4;
    return textura;
}

// ============================================================
// TEXTURA: AZOTEA / TERRAZA (techo de edificio)
// ============================================================
export function crearTexturaAzotea() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base gris concreto
    ctx.fillStyle = '#6E6E6E';
    ctx.fillRect(0, 0, 512, 512);

    // Ruido
    for (let i = 0; i < 20000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const gris = 80 + Math.random() * 60;
        ctx.fillStyle = `rgba(${gris}, ${gris}, ${gris}, ${Math.random() * 0.4})`;
        ctx.fillRect(x, y, 1, 1);
    }

    // Manchas de humedad
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radio = 30 + Math.random() * 60;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radio);
        grad.addColorStop(0, 'rgba(40, 40, 40, 0.3)');
        grad.addColorStop(1, 'rgba(40, 40, 40, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radio, 0, Math.PI * 2);
        ctx.fill();
    }

    const textura = new THREE.CanvasTexture(canvas);
    textura.wrapS = THREE.RepeatWrapping;
    textura.wrapT = THREE.RepeatWrapping;
    textura.repeat.set(2, 2);
    textura.anisotropy = 8;
    return textura;
}

// ============================================================
// TEXTURA: ASFALTO
// ============================================================
export function crearTexturaAsfalto() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2A2A2A';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 20000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const gris = 20 + Math.random() * 40;
        ctx.fillStyle = `rgba(${gris}, ${gris}, ${gris}, ${Math.random() * 0.5})`;
        ctx.fillRect(x, y, 1, 1);
    }

    for (let i = 0; i < 30; i++) {
        ctx.strokeStyle = `rgba(0, 0, 0, ${0.3 + Math.random() * 0.4})`;
        ctx.lineWidth = 0.5 + Math.random() * 1.5;
        ctx.beginPath();
        let x = Math.random() * 512;
        let y = Math.random() * 512;
        ctx.moveTo(x, y);
        for (let j = 0; j < 5 + Math.floor(Math.random() * 10); j++) {
            x += (Math.random() - 0.5) * 60;
            y += (Math.random() - 0.5) * 60;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    const textura = new THREE.CanvasTexture(canvas);
    textura.wrapS = THREE.RepeatWrapping;
    textura.wrapT = THREE.RepeatWrapping;
    textura.repeat.set(8, 8);
    textura.anisotropy = 8;
    return textura;
}

// ============================================================
// TEXTURA: ACERA
// ============================================================
export function crearTexturaAcera() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#9A9A9A';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 15000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const gris = 130 + Math.random() * 60;
        ctx.fillStyle = `rgba(${gris}, ${gris}, ${gris}, ${Math.random() * 0.4})`;
        ctx.fillRect(x, y, 1, 1);
    }

    // Juntas
    ctx.strokeStyle = 'rgba(60, 60, 60, 0.7)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= 512; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
    }
    for (let y = 0; y <= 512; y += 128) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
    }

    const textura = new THREE.CanvasTexture(canvas);
    textura.wrapS = THREE.RepeatWrapping;
    textura.wrapT = THREE.RepeatWrapping;
    textura.repeat.set(4, 4);
    textura.anisotropy = 8;
    return textura;
}

// ============================================================
// TEXTURA: MADERA (piso del balcón)
// ============================================================
export function crearTexturaMadera() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8B6F47';
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 300; i++) {
        const y = Math.random() * 1024;
        ctx.strokeStyle = `rgba(60, 40, 20, ${0.03 + Math.random() * 0.15})`;
        ctx.lineWidth = 1 + Math.random() * 4;
        ctx.beginPath();
        ctx.moveTo(0, y);
        let x = 0;
        let yActual = y;
        while (x < 1024) {
            x += 15 + Math.random() * 40;
            yActual += (Math.random() - 0.5) * 12;
            ctx.lineTo(x, yActual);
        }
        ctx.stroke();
    }

    for (let i = 0; i < 12; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const radio = 8 + Math.random() * 15;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radio);
        grad.addColorStop(0, 'rgba(60, 35, 15, 0.8)');
        grad.addColorStop(0.6, 'rgba(90, 60, 30, 0.4)');
        grad.addColorStop(1, 'rgba(90, 60, 30, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radio, 0, Math.PI * 2);
        ctx.fill();
    }

    // Listones (líneas verticales)
    for (let i = 0; i < 10; i++) {
        const x = (i / 10) * 1024;
        ctx.strokeStyle = 'rgba(40, 25, 10, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1024);
        ctx.stroke();
    }

    const textura = new THREE.CanvasTexture(canvas);
    textura.wrapS = THREE.RepeatWrapping;
    textura.wrapT = THREE.RepeatWrapping;
    textura.repeat.set(2, 2);
    textura.anisotropy = 8;
    return textura;
}

// ============================================================
// TEXTURA: MADERA OSCURA (mesa física)
// ============================================================
export function crearTexturaMaderaOscura() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#4A2F1A';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 150; i++) {
        const y = Math.random() * 512;
        ctx.strokeStyle = `rgba(20, 10, 5, ${0.05 + Math.random() * 0.2})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        let x = 0;
        let yActual = y;
        while (x < 512) {
            x += 20 + Math.random() * 30;
            yActual += (Math.random() - 0.5) * 6;
            ctx.lineTo(x, yActual);
        }
        ctx.stroke();
    }

    const textura = new THREE.CanvasTexture(canvas);
    textura.wrapS = THREE.RepeatWrapping;
    textura.wrapT = THREE.RepeatWrapping;
    textura.repeat.set(2, 2);
    textura.anisotropy = 8;
    return textura;
}

// ============================================================
// TEXTURA: NUBE
// ============================================================
export function crearTexturaNube() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);

    for (let i = 0; i < 30; i++) {
        const x = 128 + Math.random() * 256;
        const y = 128 + Math.random() * 256;
        const radio = 40 + Math.random() * 90;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radio);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.6)');
        grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radio, 0, Math.PI * 2);
        ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
}

// ============================================================
// TEXTURA: CIELO
// ============================================================
export function crearTexturaCielo() {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#1E5FAA');
    grad.addColorStop(0.3, '#4A90E2');
    grad.addColorStop(0.65, '#87CEEB');
    grad.addColorStop(1, '#E0F0FF');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2, 512);

    return new THREE.CanvasTexture(canvas);
}

// ============================================================
// TEXTURA: MESA DE FUERZAS
// ============================================================
export function crearTexturaMesaFuerzas() {
    const canvas = document.createElement('canvas');
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.scale(1, -1);
    ctx.translate(-size / 2, -size / 2);

    const cx = size / 2;
    const cy = size / 2;
    const radioExterior = size / 2 - 20;
    const radioInterior = radioExterior - 40;

    ctx.beginPath();
    ctx.arc(cx, cy, radioExterior, 0, 2 * Math.PI);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radioInterior, 0, 2 * Math.PI);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, 2 * Math.PI);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let angulo = 0; angulo < 360; angulo += 10) {
        const rad = angulo * Math.PI / 180;
        const esPrincipal = angulo % 30 === 0;
        const largoMarca = esPrincipal ? 30 : 15;

        const x1 = cx + (radioExterior - largoMarca) * Math.cos(rad);
        const y1 = cy + (radioExterior - largoMarca) * Math.sin(rad);
        const x2 = cx + radioExterior * Math.cos(rad);
        const y2 = cy + radioExterior * Math.sin(rad);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = esPrincipal ? '#000' : '#555';
        ctx.lineWidth = esPrincipal ? 3 : 1;
        ctx.stroke();

        if (esPrincipal) {
            const radioTexto = radioExterior - 55;
            const xTexto = cx + radioTexto * Math.cos(rad);
            const yTexto = cy + radioTexto * Math.sin(rad);
            ctx.save();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 22px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(angulo + '°', xTexto, yTexto);
            ctx.restore();
        }
    }

    for (let angulo = 0; angulo < 360; angulo += 90) {
        const rad = angulo * Math.PI / 180;
        const x1 = cx + 40 * Math.cos(rad);
        const y1 = cy + 40 * Math.sin(rad);
        const x2 = cx + radioExterior * Math.cos(rad);
        const y2 = cy + radioExterior * Math.sin(rad);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#222';
    ctx.fill();

    ctx.restore();

    const textura = new THREE.CanvasTexture(canvas);
    textura.anisotropy = 8;
    return textura;
}