// ============================================================
// MÓDULO PRINCIPAL
// ============================================================

import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';

import { Escenario, ALTURA_PISO } from './escenario.js';
import { crearTexturaMesaFuerzas } from './texturas.js';
import { SonidoAmbiente } from './sonido.js';

// ============================================================
// CONFIGURACIÓN BÁSICA
// ============================================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(-1, ALTURA_PISO + 1.7, -1);

// Rig VR: en VR la cámara se mueve relativa a este grupo
const rig = new THREE.Group();
rig.position.set(-1, ALTURA_PISO, -1);   // pies del usuario en el balcón
scene.add(rig);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.xr.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, ALTURA_PISO + 0.9, 6.5);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// ✅ CÁMARA AJUSTADA: permitir mirar completamente hacia abajo desde el balcón
controls.maxPolarAngle = Math.PI;        // Permite mirar 100% hacia abajo
controls.minPolarAngle = 0;              // Permite mirar 100% hacia arriba
controls.minDistance = 0.5;
controls.maxDistance = 30;

controls.update();

// ============================================================
// ESCENARIO
// ============================================================
const escenario = new Escenario(scene);

// ============================================================
// SONIDO DE AMBIENTE
// ============================================================
const sonido = new SonidoAmbiente();

// ============================================================
// MESA DE FUERZAS
// ============================================================
const texturaMesa = crearTexturaMesaFuerzas();
const materialLateral = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.3 });
const materialTapaSuperior = new THREE.MeshStandardMaterial({ map: texturaMesa, roughness: 0.8, metalness: 0.1 });
const materialTapaInferior = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });

const mesa = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.05, 64),
    [materialLateral, materialTapaSuperior, materialTapaInferior]
);
mesa.position.set(0, ALTURA_PISO + 0.89, 5.5);
mesa.rotation.y = -Math.PI / 2;
mesa.castShadow = true;
mesa.receiveShadow = true;
scene.add(mesa);

// ============================================================
// FLECHAS
// ============================================================
const flechas = [];
const coloresFlechas = [0xff4444, 0x44ff44, 0x4444ff];

for (let i = 0; i < 3; i++) {
    const flechaGroup = new THREE.Group();
    const cuerpoMaterial = new THREE.MeshStandardMaterial({ color: coloresFlechas[i], roughness: 0.4, metalness: 0.2 });

    const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 8), cuerpoMaterial);
    cuerpo.rotation.z = Math.PI / 2;
    cuerpo.position.x = 0.5;
    cuerpo.castShadow = true;
    flechaGroup.add(cuerpo);

    const punta = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 8), cuerpoMaterial);
    punta.rotation.z = -Math.PI / 2;
    punta.position.x = 1.05;
    punta.castShadow = true;
    flechaGroup.add(punta);

    flechaGroup.position.set(0, ALTURA_PISO + 0.94, 5.5);
    flechaGroup.rotation.y = [30, 330, 180][i] * Math.PI / 180;

    scene.add(flechaGroup);
    flechas.push(flechaGroup);
}

// ============================================================
// BURBUJA
// ============================================================
const burbujaMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00, roughness: 0.1, metalness: 0.3,
    emissive: 0x00ff00, emissiveIntensity: 0.2
});
const burbuja = new THREE.Mesh(new THREE.SphereGeometry(0.04, 32, 32), burbujaMaterial);
burbuja.position.set(0, ALTURA_PISO + 0.99, 5.5);
burbuja.castShadow = true;
scene.add(burbuja);

// ============================================================
// SLIDERS 3D
// ============================================================
const sliders3D = [];
const alturaSliders = ALTURA_PISO + 1.3;

function crearSlider3D(posX, posY, posZ, nombre, min, max, valorInicial, color, rotY) {
    const sliderGroup = new THREE.Group();

    const riel = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.02, 0.02),
        new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.6, metalness: 0.4 })
    );
    riel.castShadow = true;
    sliderGroup.add(riel);

    const perilla = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 16, 16),
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.2 })
    );
    perilla.castShadow = true;

    const rango = max - min;
    const porcentaje = (valorInicial - min) / rango;
    perilla.position.set((porcentaje - 0.5) * 0.6, 0, 0);
    sliderGroup.add(perilla);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const unidad = nombre.startsWith('angulo') ? '°' : 'g';
    ctx.fillText(valorInicial + unidad, 128, 32);

    const textura = new THREE.CanvasTexture(canvas);
    const texto3D = new THREE.Mesh(
        new THREE.PlaneGeometry(0.25, 0.06),
        new THREE.MeshBasicMaterial({ map: textura, transparent: true, side: THREE.DoubleSide })
    );
    texto3D.position.set(0, 0.08, 0);
    sliderGroup.add(texto3D);

    sliderGroup.userData = {
        nombre, min, max, valor: valorInicial,
        perilla, color, canvas, ctx, textura, texto3D, unidad
    };

    sliderGroup.position.set(posX, posY, posZ);
    sliderGroup.rotation.y = rotY || 0;
    scene.add(sliderGroup);
    sliders3D.push(sliderGroup);
    return sliderGroup;
}

// Sliders pegados a la pared derecha del balcón (x = 3.85, z = 6)
// Rotados -90° sobre Y para que el riel quede en el plano de la pared
// ============================================================
// PANEL DE MADERA EN LA PARED DERECHA DEL BALCÓN
// Sirve como superficie de montaje para los sliders 3D
// ============================================================
const panelMat = new THREE.MeshStandardMaterial({
    color: 0x4A2F1A,
    roughness: 0.6,
    metalness: 0.15
});

const panelSliders = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 2.4, 1.2),
    panelMat
);
// Sobresale de la pared derecha (x=4) hacia el centro del balcón (hacia -x)
panelSliders.position.set(3.9, ALTURA_PISO + 1.3, 6);
panelSliders.castShadow = true;
panelSliders.receiveShadow = true;
scene.add(panelSliders);
const ROT_PARED_DERECHA = -Math.PI / 2;
// Los sliders van pegados al panel de madera (x = 3.83 es el frente del panel)
crearSlider3D(3.83, alturaSliders + 0.9, 6, 'angulo1', 0, 360, 30, 0xff4444, ROT_PARED_DERECHA);
crearSlider3D(3.83, alturaSliders + 0.75, 6, 'masa1', 0, 500, 100, 0xff8888, ROT_PARED_DERECHA);
crearSlider3D(3.83, alturaSliders + 0.5, 6, 'angulo2', 0, 360, 330, 0x44ff44, ROT_PARED_DERECHA);
crearSlider3D(3.83, alturaSliders + 0.35, 6, 'masa2', 0, 500, 100, 0x88ff88, ROT_PARED_DERECHA);
crearSlider3D(3.83, alturaSliders + 0.1, 6, 'angulo3', 0, 360, 180, 0x4444ff, ROT_PARED_DERECHA);
crearSlider3D(3.83, alturaSliders - 0.05, 6, 'masa3', 0, 500, 173, 0x8888ff, ROT_PARED_DERECHA);
// ============================================================
// ETIQUETAS
// ============================================================
function crearEtiqueta(texto, posX, posY, posZ, color, rotY) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = color;
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, 128, 64);

    const textura = new THREE.CanvasTexture(canvas);
    const etiqueta = new THREE.Mesh(
        new THREE.PlaneGeometry(0.2, 0.1),
        new THREE.MeshBasicMaterial({ map: textura, transparent: true, side: THREE.DoubleSide })
    );
    etiqueta.position.set(posX, posY, posZ);
    etiqueta.rotation.y = rotY || 0;
    scene.add(etiqueta);
}

crearEtiqueta('F1', 3.83, alturaSliders + 1.05, 6, '#ff4444', ROT_PARED_DERECHA);
crearEtiqueta('F2', 3.83, alturaSliders + 0.65, 6, '#44ff44', ROT_PARED_DERECHA);
crearEtiqueta('F3', 3.83, alturaSliders + 0.25, 6, '#4444ff', ROT_PARED_DERECHA);

// ============================================================
// BOTONES 3D
// ============================================================
function crearBoton3D(texto, posX, posY, posZ, colorFondo, colorTexto, accion) {
    const botonGroup = new THREE.Group();

    const placa = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.12, 0.02),
        new THREE.MeshStandardMaterial({
            color: colorFondo, emissive: colorFondo, emissiveIntensity: 0.2,
            roughness: 0.3, metalness: 0.2
        })
    );
    placa.castShadow = true;
    botonGroup.add(placa);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = colorTexto;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, 256, 64);

    const textura = new THREE.CanvasTexture(canvas);
    const texto3D = new THREE.Mesh(
        new THREE.PlaneGeometry(0.38, 0.1),
        new THREE.MeshBasicMaterial({ map: textura, transparent: true, side: THREE.DoubleSide })
    );
    texto3D.position.set(0, 0, 0.011);
    botonGroup.add(texto3D);

    botonGroup.userData = {
        esBoton: true, accion, colorOriginal: colorFondo, placa, texto: texto3D
    };

    botonGroup.position.set(posX, posY, posZ);
    scene.add(botonGroup);
    return botonGroup;
}

const botonGuardar3D = crearBoton3D('GUARDAR', 3.83, alturaSliders - 0.45, 6.3, 0x43e97b, '#0f0c29', 'guardar');
botonGuardar3D.rotation.y = -Math.PI / 2;

const botonInforme3D = crearBoton3D('INFORME', 3.83, alturaSliders - 0.7, 6.3, 0x4facfe, '#0f0c29', 'informe');
botonInforme3D.rotation.y = -Math.PI / 2;

// ============================================================
// VR
// ============================================================
document.body.appendChild(VRButton.createButton(renderer));

const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);

[controller1, controller2].forEach(c => {
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x4facfe, roughness: 0.2, metalness: 0.5 })
    );
    c.add(sphere);

    const laser = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -2)]),
        new THREE.LineBasicMaterial({ color: 0x00ffff })
    );
    c.add(laser);
    rig.add(c);   // antes: scene.add(c);
});

// ============================================================
// INTERACCIÓN VR
// ============================================================
const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();

function onSelectStart(event) {
    const controller = event.target;
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const intersectsSliders = raycaster.intersectObjects(sliders3D, true);
    if (intersectsSliders.length > 0) {
        let sliderHit = intersectsSliders[0].object;
        while (sliderHit.parent && !sliderHit.userData.nombre) sliderHit = sliderHit.parent;
        if (sliderHit.userData && sliderHit.userData.nombre) {
            controller.userData.sliderAgarrado = sliderHit;
            return;
        }
    }

    const intersectsBotones = raycaster.intersectObjects([botonGuardar3D, botonInforme3D], true);
    if (intersectsBotones.length > 0) {
        let botonHit = intersectsBotones[0].object;
        while (botonHit.parent && !botonHit.userData.esBoton) botonHit = botonHit.parent;
        if (botonHit.userData && botonHit.userData.esBoton) {
            if (botonHit.userData.accion === 'guardar') guardarConfiguracion();
            else if (botonHit.userData.accion === 'informe') generarInforme();

            const colorOriginal = botonHit.userData.colorOriginal;
            botonHit.userData.placa.material.color.setHex(0xffffff);
            setTimeout(() => {
                botonHit.userData.placa.material.color.setHex(colorOriginal);
            }, 300);
        }
    }
}

function onSelectEnd(event) {
    event.target.userData.sliderAgarrado = null;
}

controller1.addEventListener('selectstart', onSelectStart);
controller1.addEventListener('selectend', onSelectEnd);
controller2.addEventListener('selectstart', onSelectStart);
controller2.addEventListener('selectend', onSelectEnd);

// ============================================================
// ✅ ACTIVAR SONIDO AUTOMÁTICAMENTE AL ENTRAR EN VR
// ============================================================
const posCamaraEscritorio = camera.position.clone();

renderer.xr.addEventListener('sessionstart', () => {
    console.log('🥽 Sesión VR iniciada — activando sonido ambiente');
    sonido.iniciar();

    controls.enabled = false;          // OrbitControls no debe pelear con el visor
    rig.add(camera);                   // la cámara pasa a ser hija del rig
    camera.position.set(0, 0, 0);      // el visor aporta la altura real del usuario
    camera.quaternion.identity();
});

renderer.xr.addEventListener('sessionend', () => {
    console.log('🥽 Sesión VR terminada');
    sonido.silenciar();

    scene.add(camera);                 // vuelve a la vista de escritorio
    camera.position.copy(posCamaraEscritorio);
    controls.enabled = true;
    controls.update();
});

// También activar sonido si el usuario hace clic (PC, sin VR)
document.addEventListener('click', () => {
    sonido.iniciar();
}, { once: true });

// ============================================================
// LÓGICA DE FUERZAS
// ============================================================
const estado = {
    angulo1: 30, masa1: 100,
    angulo2: 330, masa2: 100,
    angulo3: 180, masa3: 173
};

function vectorDeFuerza(angulo, masa) {
    const magnitud = masa / 500;
    const rad = angulo * Math.PI / 180;
    return { x: magnitud * Math.cos(rad), z: magnitud * Math.sin(rad) };
}

function actualizarFlechas() {
    flechas[0].rotation.y = (estado.angulo1 - 90) * Math.PI / 180;
    flechas[1].rotation.y = (estado.angulo2 - 90) * Math.PI / 180;
    flechas[2].rotation.y = (estado.angulo3 - 90) * Math.PI / 180;

    const escalaMax = 1.5, escalaMin = 0.3;
    for (let i = 0; i < 3; i++) {
        const masa = [estado.masa1, estado.masa2, estado.masa3][i];
        const escala = escalaMin + (masa / 500) * (escalaMax - escalaMin);
        flechas[i].scale.set(escala, 1, 1);
    }

    const v1 = vectorDeFuerza(estado.angulo1, estado.masa1);
    const v2 = vectorDeFuerza(estado.angulo2, estado.masa2);
    const v3 = vectorDeFuerza(estado.angulo3, estado.masa3);
    const resultante = { x: v1.x + v2.x + v3.x, z: v1.z + v2.z + v3.z };
    const magnitud = Math.sqrt(resultante.x * resultante.x + resultante.z * resultante.z);

    const desplazamientoMax = 0.3;
    burbuja.position.x = resultante.x * desplazamientoMax;
    burbuja.position.z = resultante.z * desplazamientoMax + 5.5;

    if (magnitud < 0.1) {
        burbuja.material.color.setHex(0x00ff00);
        burbuja.material.emissive.setHex(0x00ff00);
        document.getElementById('estado-texto').textContent = '✅ Equilibrio';
        document.getElementById('estado').className = 'equilibrio';
    } else if (magnitud < 0.5) {
        burbuja.material.color.setHex(0xffaa00);
        burbuja.material.emissive.setHex(0xffaa00);
        document.getElementById('estado-texto').textContent = '⚠️ Casi equilibrio';
        document.getElementById('estado').className = '';
    } else {
        burbuja.material.color.setHex(0xff0000);
        burbuja.material.emissive.setHex(0xff0000);
        document.getElementById('estado-texto').textContent = '❌ Desequilibrio';
        document.getElementById('estado').className = 'desequilibrio';
    }
}

// ============================================================
// SLIDERS HTML
// ============================================================
function configurarSlider(idSlider, idValor, propiedad, unidad) {
    const slider = document.getElementById(idSlider);
    const valor = document.getElementById(idValor);
    slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        estado[propiedad] = val;
        valor.textContent = val + unidad;
        actualizarFlechas();
    });
}

configurarSlider('angulo1', 'angulo1-valor', 'angulo1', '°');
configurarSlider('masa1', 'masa1-valor', 'masa1', 'g');
configurarSlider('angulo2', 'angulo2-valor', 'angulo2', '°');
configurarSlider('masa2', 'masa2-valor', 'masa2', 'g');
configurarSlider('angulo3', 'angulo3-valor', 'angulo3', '°');
configurarSlider('masa3', 'masa3-valor', 'masa3', 'g');

actualizarFlechas();

// ============================================================
// GUARDAR CONFIGURACIONES
// ============================================================
const configuracionesGuardadas = [];

function calcularResultante() {
    const v1 = vectorDeFuerza(estado.angulo1, estado.masa1);
    const v2 = vectorDeFuerza(estado.angulo2, estado.masa2);
    const v3 = vectorDeFuerza(estado.angulo3, estado.masa3);
    const rx = v1.x + v2.x + v3.x;
    const rz = v1.z + v2.z + v3.z;
    const magnitud = Math.sqrt(rx * rx + rz * rz);
    return { x: rx, z: rz, magnitud, enEquilibrio: magnitud < 0.1 };
}

function guardarConfiguracion() {
    const config = {
        fecha: new Date().toLocaleString(),
        angulo1: estado.angulo1, masa1: estado.masa1,
        angulo2: estado.angulo2, masa2: estado.masa2,
        angulo3: estado.angulo3, masa3: estado.masa3,
        resultante: calcularResultante()
    };
    configuracionesGuardadas.push(config);
    actualizarListaConfiguraciones();

    const btn = document.getElementById('btn-guardar');
    if (btn) {
        btn.textContent = '✅ Guardado';
        setTimeout(() => btn.textContent = '💾 Guardar Configuración', 1500);
    }
}

function actualizarListaConfiguraciones() {
    const lista = document.getElementById('lista-config');
    if (!lista) return;

    if (configuracionesGuardadas.length === 0) {
        lista.innerHTML = '<li class="vacio">No hay configuraciones guardadas</li>';
        return;
    }

    lista.innerHTML = configuracionesGuardadas.map((config, index) => `
        <li>
            <strong>#${index + 1}</strong> - 
            F1: ${Math.round(config.angulo1)}° / ${Math.round(config.masa1)}g | 
            F2: ${Math.round(config.angulo2)}° / ${Math.round(config.masa2)}g | 
            F3: ${Math.round(config.angulo3)}° / ${Math.round(config.masa3)}g
            ${config.resultante.enEquilibrio ? '✅' : '❌'}
        </li>
    `).join('');
}

document.getElementById('btn-guardar').addEventListener('click', guardarConfiguracion);

// ============================================================
// GENERAR INFORME
// ============================================================
async function generarInforme() {
    if (configuracionesGuardadas.length === 0) {
        alert('⚠️ No hay configuraciones guardadas.');
        return;
    }

    const children = [];

    children.push(new Paragraph({
        text: 'INFORME DE PRÁCTICA - MESA DE FUERZAS VR',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 }
    }));

    children.push(new Paragraph({
        children: [
            new TextRun({ text: 'Fecha: ', bold: true }),
            new TextRun({ text: new Date().toLocaleString() })
        ],
        spacing: { after: 200 }
    }));

    children.push(new Paragraph({
        children: [
            new TextRun({ text: 'Total de configuraciones: ', bold: true }),
            new TextRun({ text: configuracionesGuardadas.length.toString() })
        ],
        spacing: { after: 400 }
    }));

    const filasTabla = [];
    filasTabla.push(new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ text: '#', alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: 'F1 Ángulo', alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: 'F1 Masa', alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: 'F2 Ángulo', alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: 'F2 Masa', alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: 'F3 Ángulo', alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: 'F3 Masa', alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: 'Estado', alignment: AlignmentType.CENTER })] })
        ]
    }));

    configuracionesGuardadas.forEach((config, index) => {
        filasTabla.push(new TableRow({
            children: [
                new TableCell({ children: [new Paragraph({ text: (index + 1).toString(), alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: Math.round(config.angulo1) + '°', alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: Math.round(config.masa1) + 'g', alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: Math.round(config.angulo2) + '°', alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: Math.round(config.masa2) + 'g', alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: Math.round(config.angulo3) + '°', alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: Math.round(config.masa3) + 'g', alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: config.resultante.enEquilibrio ? '✅ Equilibrio' : '❌ Desequilibrio', alignment: AlignmentType.CENTER })] })
            ]
        }));
    });

    children.push(new Table({ rows: filasTabla, width: { size: 100, type: WidthType.PERCENTAGE } }));

    const doc = new Document({ sections: [{ children }] });

    try {
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Informe_MesaFuerzas_${new Date().toISOString().slice(0, 10)}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error al generar informe:', error);
        alert('Error al generar el informe: ' + error.message);
    }
}

document.getElementById('btn-generar-informe').addEventListener('click', generarInforme);

// ============================================================
// LOOP PRINCIPAL
// ============================================================
let ultimoTiempo = performance.now();

function animate() {
    renderer.setAnimationLoop(animate);

    const ahora = performance.now();
    const dt = Math.min((ahora - ultimoTiempo) / 1000, 0.1);
    ultimoTiempo = ahora;

    escenario.actualizar(dt);

    [controller1, controller2].forEach(controller => {
        const slider = controller.userData.sliderAgarrado;
        if (slider) {
            const posControlador = new THREE.Vector3();
            controller.getWorldPosition(posControlador);
            slider.worldToLocal(posControlador);

            const rango = slider.userData.max - slider.userData.min;
            // Si el slider está rotado -90° sobre Y, la perilla se mueve en el eje Z local
            const ejeLocal = (slider.rotation.y !== 0) ? posControlador.z : posControlador.x;
            let porcentaje = (ejeLocal / 0.6) + 0.5;
            porcentaje = Math.max(0, Math.min(1, porcentaje));

            const nuevoValor = slider.userData.min + porcentaje * rango;
            slider.userData.valor = nuevoValor;
            slider.userData.perilla.position.x = (porcentaje - 0.5) * 0.6;

            if (slider.userData.ctx && slider.userData.textura) {
                const ctx = slider.userData.ctx;
                const unidad = slider.userData.unidad || '';
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, 256, 64);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 40px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(Math.round(nuevoValor) + unidad, 128, 32);
                slider.userData.textura.needsUpdate = true;
            }

            const nombre = slider.userData.nombre;
            if (nombre === 'angulo1') estado.angulo1 = nuevoValor;
            if (nombre === 'masa1') estado.masa1 = nuevoValor;
            if (nombre === 'angulo2') estado.angulo2 = nuevoValor;
            if (nombre === 'masa2') estado.masa2 = nuevoValor;
            if (nombre === 'angulo3') estado.angulo3 = nuevoValor;
            if (nombre === 'masa3') estado.masa3 = nuevoValor;

            actualizarFlechas();
        }
    });

    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});