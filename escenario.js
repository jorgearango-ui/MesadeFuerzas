// ============================================================
// MÓDULO: ESCENARIO
// PH con apartamento interior + Balcón abierto + Ciudad + Calle + Autos
// ============================================================

import * as THREE from 'three';
import {
    crearTexturaFachada,
    crearTexturaAzotea,
    crearTexturaAsfalto,
    crearTexturaAcera,
    crearTexturaMadera,
    crearTexturaMaderaOscura,
    crearTexturaNube,
    crearTexturaCielo
} from './texturas.js';

export const ALTURA_PISO = 45;

// ============================================================
// CLASE PRINCIPAL DEL ESCENARIO
// ============================================================
export class Escenario {

    constructor(scene) {
        this.scene = scene;
        this.autos = [];
        this.autosCruzando = [];
        this.nubes = [];
        this.tiempo = 0;

        scene.background = crearTexturaCielo();
        scene.fog = new THREE.FogExp2(0xB0D0F0, 0.0025);

        this._crearIluminacion();
        this._crearEdificioConPH();
        this._crearCalle();
        this._crearCiudadEnCuadricula();
        this._crearAmbiente();
        this._crearTrafico();
        this._crearNubes();
    }

    // ============================================================
    // ILUMINACIÓN
    // ============================================================
    _crearIluminacion() {
        const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.4);
        this.scene.add(ambientLight);

        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x8B7355, 0.7);
        this.scene.add(hemiLight);

        const sunLight = new THREE.DirectionalLight(0xfff5e0, 2.2);
        sunLight.position.set(25, 35, 15);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 4096;
        sunLight.shadow.mapSize.height = 4096;
        sunLight.shadow.camera.left = -50;
        sunLight.shadow.camera.right = 50;
        sunLight.shadow.camera.top = 50;
        sunLight.shadow.camera.bottom = -50;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 250;
        sunLight.shadow.bias = -0.0003;
        sunLight.shadow.normalBias = 0.02;
        this.scene.add(sunLight);

        const fillLight = new THREE.DirectionalLight(0xaaccff, 0.5);
        fillLight.position.set(-15, 10, -10);
        this.scene.add(fillLight);
    }

    // ============================================================
    // EDIFICIO CON PH (apartamento + balcón integrados)
    // ============================================================
    _crearEdificioConPH() {
        const grupo = new THREE.Group();

        const texturaFachada = crearTexturaFachada('#B8B8B8', 6, 20);
        const texturaAzotea = crearTexturaAzotea();

        const matFachada = new THREE.MeshStandardMaterial({
            map: texturaFachada, roughness: 0.9, metalness: 0.05
        });
        const matAzotea = new THREE.MeshStandardMaterial({
            map: texturaAzotea, roughness: 0.95, metalness: 0.05
        });
        const matConcreto = new THREE.MeshStandardMaterial({
            color: 0xE0E0E0, roughness: 0.85, metalness: 0.05
        });

        // ------------------------------------------------------------
        // PISOS 1-14 (bloque sólido bajo el PH)
        // Va desde y=0 hasta y=ALTURA_PISO=45
        // Dimensiones: 14 ancho × 12 fondo, centrado en x=0, z=0
        // ------------------------------------------------------------
        const materialesBloque = [
            matFachada, matFachada,   // derecha, izquierda
            matAzotea, matAzotea,     // arriba (no se verá, cubierto por PH), abajo
            matFachada, matFachada    // frente, atrás
        ];

        const bloqueInferior = new THREE.Mesh(
            new THREE.BoxGeometry(14, ALTURA_PISO, 12),
            materialesBloque
        );
        bloqueInferior.position.set(0, ALTURA_PISO / 2, 0);
        bloqueInferior.castShadow = true;
        bloqueInferior.receiveShadow = true;
        grupo.add(bloqueInferior);

        // ------------------------------------------------------------
        // PH: APARTAMENTO INTERIOR (8 × 8 m, y=45 a y=47.8)
        // El apartamento está en el centro del bloque, ocupando
        // desde z = -4 hasta z = 4
        // ------------------------------------------------------------
        this._crearApartamentoInterior(grupo, matConcreto);

        // ------------------------------------------------------------
        // BALCÓN ABIERTO (adosado al frente del PH)
        // Ocupa desde z = 4 hasta z = 8
        // ------------------------------------------------------------
        this._crearBalconAbierto(grupo, matConcreto);

        // ------------------------------------------------------------
        // AZOTEA (techo encima de todo, y = 48.5)
        // ------------------------------------------------------------
        const azotea = new THREE.Mesh(
            new THREE.BoxGeometry(14.5, 0.4, 12.5),
            matAzotea
        );
        azotea.position.set(0, ALTURA_PISO + 3.5, 0);
        azotea.castShadow = true;
        azotea.receiveShadow = true;
        grupo.add(azotea);

        // Borde de azotea
        const bordeAzotea = new THREE.Mesh(
            new THREE.BoxGeometry(14.7, 0.5, 12.7),
            new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.6, roughness: 0.5 })
        );
        bordeAzotea.position.set(0, ALTURA_PISO + 3.75, 0);
        grupo.add(bordeAzotea);

        this.scene.add(grupo);
        this.grupoEdificioPrincipal = grupo;
    }

    // ============================================================
    // APARTAMENTO INTERIOR (8 × 8 × 2.8 m)
    // ============================================================
    _crearApartamentoInterior(grupo, matConcreto) {
        const ancho = 8;
        const fondo = 8;
        const alto = 2.8;
        const centroZ = 0;
        const baseY = ALTURA_PISO;

        // ------------------------------------------------------------
        // PISO de madera del apartamento
        // ------------------------------------------------------------
        const texturaPiso = crearTexturaMadera();
        const pisoMat = new THREE.MeshStandardMaterial({
            map: texturaPiso, roughness: 0.7, metalness: 0.05
        });
        const piso = new THREE.Mesh(
            new THREE.PlaneGeometry(ancho, fondo),
            pisoMat
        );
        piso.rotation.x = -Math.PI / 2;
        piso.position.set(0, baseY, centroZ);
        piso.receiveShadow = true;
        grupo.add(piso);

        // ------------------------------------------------------------
        // TECHO del apartamento
        // ------------------------------------------------------------
        const techoMat = new THREE.MeshStandardMaterial({
            color: 0xF5F5F0, roughness: 0.9, metalness: 0.0
        });
        const techo = new THREE.Mesh(
            new THREE.PlaneGeometry(ancho, fondo),
            techoMat
        );
        techo.rotation.x = Math.PI / 2;
        techo.position.set(0, baseY + alto, centroZ);
        grupo.add(techo);

        // ------------------------------------------------------------
        // PARED TRASERA (z = -4, fondo del apartamento)
        // ------------------------------------------------------------
        const paredTrasera = new THREE.Mesh(
            new THREE.BoxGeometry(ancho, alto, 0.2),
            matConcreto
        );
        paredTrasera.position.set(0, baseY + alto / 2, centroZ - fondo / 2);
        paredTrasera.castShadow = true;
        paredTrasera.receiveShadow = true;
        grupo.add(paredTrasera);

        // ------------------------------------------------------------
        // PARED LATERAL IZQUIERDA (x = -4)
        // ------------------------------------------------------------
        const paredIzq = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, alto, fondo),
            matConcreto
        );
        paredIzq.position.set(-ancho / 2, baseY + alto / 2, centroZ);
        paredIzq.castShadow = true;
        paredIzq.receiveShadow = true;
        grupo.add(paredIzq);

        // ------------------------------------------------------------
        // PARED LATERAL DERECHA (x = +4) — pero con puerta al balcón
        // ------------------------------------------------------------
        // La pared derecha está dividida en dos: una parte hacia el fondo
        // (que separa el apartamento del balcón) y otra parte que es la
        // pared lateral del balcón.
        // Esta pared va solo hasta z = +4 - 3 = +1, dejando el resto abierto.

        // Pared lateral derecha del apartamento (parte trasera)
        const paredDer = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, alto, fondo - 3),
            matConcreto
        );
        paredDer.position.set(ancho / 2, baseY + alto / 2, centroZ - 1.5);
        paredDer.castShadow = true;
        paredDer.receiveShadow = true;
        grupo.add(paredDer);

        // ------------------------------------------------------------
        // PARED FRONTAL (z = +4) — con ventanal grande al balcón
        // La pared frontal es un marco grueso con un hueco en el centro
        // ------------------------------------------------------------
        const anchoHueco = 5;
        const altoHueco = 2.4;

        // Marco frontal: 4 segmentos
        const grosorPared = 0.2;
        const anchoLadoIzq = (ancho - anchoHueco) / 2;
        const anchoLadoDer = (ancho - anchoHueco) / 2;
        const altoArriba = alto - altoHueco;

        // Segmento izquierdo
        const segIzq = new THREE.Mesh(
            new THREE.BoxGeometry(anchoLadoIzq, alto, grosorPared),
            matConcreto
        );
        segIzq.position.set(-ancho / 2 + anchoLadoIzq / 2, baseY + alto / 2, centroZ + fondo / 2);
        segIzq.castShadow = true;
        segIzq.receiveShadow = true;
        grupo.add(segIzq);

        // Segmento derecho
        const segDer = new THREE.Mesh(
            new THREE.BoxGeometry(anchoLadoDer, alto, grosorPared),
            matConcreto
        );
        segDer.position.set(ancho / 2 - anchoLadoDer / 2, baseY + alto / 2, centroZ + fondo / 2);
        segDer.castShadow = true;
        segDer.receiveShadow = true;
        grupo.add(segDer);

        // Segmento superior (encima del hueco)
        const segSup = new THREE.Mesh(
            new THREE.BoxGeometry(anchoHueco, altoArriba, grosorPared),
            matConcreto
        );
        segSup.position.set(0, baseY + altoHueco + altoArriba / 2, centroZ + fondo / 2);
        segSup.castShadow = true;
        segSup.receiveShadow = true;
        grupo.add(segSup);

        // Segmento inferior (pequeño zócalo debajo del hueco)
        const alturaZocalo = 0.1;
        const segInf = new THREE.Mesh(
            new THREE.BoxGeometry(anchoHueco, alturaZocalo, grosorPared),
            matConcreto
        );
        segInf.position.set(0, baseY + alturaZocalo / 2, centroZ + fondo / 2);
        grupo.add(segInf);

         // ------------------------------------------------------------
        // VENTANAL CORREDIZO — CON PUERTA ABIERTA
        // Hoja izquierda cerrada (vidrio), hoja derecha deslizada
        // El hueco queda libre para pasar al balcón
        // ------------------------------------------------------------
        const vidrioMat = new THREE.MeshPhysicalMaterial({
            color: 0xAADDFF,
            metalness: 0.1,
            roughness: 0.05,
            transmission: 0.85,
            transparent: true,
            opacity: 0.25,
            ior: 1.5,
            thickness: 0.05
        });
        const marcoMat = new THREE.MeshStandardMaterial({
            color: 0x1A1A1A, metalness: 0.8, roughness: 0.3
        });

        // Ancho total del hueco: anchoHueco = 5. Lo dividimos en 2 hojas de 2.5
        const anchoHoja = anchoHueco / 2;

        // Hoja IZQUIERDA (cerrada, con vidrio) — cubre desde x=-2.5 hasta x=0
        const ventanaIzq = new THREE.Mesh(
            new THREE.PlaneGeometry(anchoHoja, altoHueco - alturaZocalo),
            vidrioMat
        );
        ventanaIzq.position.set(
            -anchoHueco / 4,
            baseY + (altoHueco + alturaZocalo) / 2,
            centroZ + fondo / 2
        );
        grupo.add(ventanaIzq);

        // Hoja DERECHA (deslizada hacia la izquierda, superpuesta a la hoja izquierda)
        // Representa la "puerta abierta": se ve el marco pero el hueco está libre
        const ventanaDer = new THREE.Mesh(
            new THREE.PlaneGeometry(anchoHoja, altoHueco - alturaZocalo),
            vidrioMat
        );
        // Deslizada completamente a la izquierda: superpuesta a la hoja izquierda
        ventanaDer.position.set(
            -anchoHueco / 4,
            baseY + (altoHueco + alturaZocalo) / 2,
            centroZ + fondo / 2 + 0.05 // Ligeramente desplazada en z para que no parpadee
        );
        grupo.add(ventanaDer);

        // Riel inferior (guía de la puerta corrediza)
        const rielInferior = new THREE.Mesh(
            new THREE.BoxGeometry(anchoHueco + 0.2, 0.03, 0.08),
            marcoMat
        );
        rielInferior.position.set(0, baseY + 0.05, centroZ + fondo / 2);
        grupo.add(rielInferior);
        // ------------------------------------------------------------
        // ILUMINACIÓN INTERIOR (lámpara de techo)
        // ------------------------------------------------------------
        const lamparaBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.2, 0.1, 16),
            new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.4 })
        );
        lamparaBase.position.set(0, baseY + alto - 0.05, centroZ);
        grupo.add(lamparaBase);

        const bombillo = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 12, 12),
            new THREE.MeshStandardMaterial({
                color: 0xFFF8E0, emissive: 0xFFE0A0, emissiveIntensity: 1.5
            })
        );
        bombillo.position.set(0, baseY + alto - 0.15, centroZ);
        grupo.add(bombillo);

        const luzInterior = new THREE.PointLight(0xFFE0A0, 1.2, 10, 2);
        luzInterior.position.set(0, baseY + alto - 0.3, centroZ);
        grupo.add(luzInterior);

        // ------------------------------------------------------------
        // MOBILIARIO: SALA DE ESTAR
        // ------------------------------------------------------------
        this._crearMobiliarioApartamento(grupo, baseY, centroZ);
    }

    // ============================================================
    // MOBILIARIO DEL APARTAMENTO (sofá, mesa, TV, alfombra, planta)
    // ============================================================
    _crearMobiliarioApartamento(grupo, baseY, centroZ) {
        // ------------------------------------------------------------
        // ALFOMBRA
        // ------------------------------------------------------------
        const alfombraMat = new THREE.MeshStandardMaterial({
            color: 0x8B3A3A, roughness: 0.95, metalness: 0.0
        });
        const alfombra = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 3),
            alfombraMat
        );
        alfombra.rotation.x = -Math.PI / 2;
        alfombra.position.set(0, baseY + 0.01, centroZ + 0.5);
        alfombra.receiveShadow = true;
        grupo.add(alfombra);

        // Borde de la alfombra (más oscuro)
        const bordeAlfombra = new THREE.Mesh(
            new THREE.RingGeometry(1.8, 2.0, 4),
            new THREE.MeshStandardMaterial({ color: 0x5C2020, roughness: 0.9 })
        );
        bordeAlfombra.rotation.x = -Math.PI / 2;
        bordeAlfombra.rotation.z = Math.PI / 4;
        bordeAlfombra.position.set(0, baseY + 0.015, centroZ + 0.5);
        bordeAlfombra.scale.set(1.4, 1, 1);
        grupo.add(bordeAlfombra);

        // ------------------------------------------------------------
        // SOFÁ (frente al ventanal, mirando hacia la ciudad)
        // ------------------------------------------------------------
        const sofaMat = new THREE.MeshStandardMaterial({
            color: 0x4A5568, roughness: 0.85, metalness: 0.0
        });
        const cojinMat = new THREE.MeshStandardMaterial({
            color: 0x2D3748, roughness: 0.9, metalness: 0.0
        });

        const sofaBase = new THREE.Mesh(
            new THREE.BoxGeometry(2.4, 0.35, 0.9),
            sofaMat
        );
        sofaBase.position.set(0, baseY + 0.3, centroZ - 1.5);
        sofaBase.castShadow = true;
        sofaBase.receiveShadow = true;
        grupo.add(sofaBase);

        const sofaRespaldo = new THREE.Mesh(
            new THREE.BoxGeometry(2.4, 0.6, 0.15),
            sofaMat
        );
        sofaRespaldo.position.set(0, baseY + 0.6, centroZ - 1.9);
        sofaRespaldo.castShadow = true;
        grupo.add(sofaRespaldo);

        // Cojines del sofá
        for (let i = -1; i <= 1; i++) {
            const cojin = new THREE.Mesh(
                new THREE.BoxGeometry(0.7, 0.15, 0.7),
                cojinMat
            );
            cojin.position.set(i * 0.75, baseY + 0.5, centroZ - 1.5);
            cojin.castShadow = true;
            grupo.add(cojin);
        }

        // Brazos del sofá
        for (let lado = -1; lado <= 1; lado += 2) {
            const brazo = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 0.5, 0.9),
                sofaMat
            );
            brazo.position.set(lado * 1.25, baseY + 0.5, centroZ - 1.5);
            brazo.castShadow = true;
            grupo.add(brazo);
        }

        // ------------------------------------------------------------
        // MESA DE CENTRO (frente al sofá)
        // ------------------------------------------------------------
        const mesaMat = new THREE.MeshStandardMaterial({
            color: 0x5C3A1E, roughness: 0.6, metalness: 0.2
        });
        const mesaSuperficie = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 0.08, 0.7),
            mesaMat
        );
        mesaSuperficie.position.set(0, baseY + 0.4, centroZ + 0.3);
        mesaSuperficie.castShadow = true;
        mesaSuperficie.receiveShadow = true;
        grupo.add(mesaSuperficie);

        for (let i = -1; i <= 1; i += 2) {
            for (let j = -1; j <= 1; j += 2) {
                const pataMesa = new THREE.Mesh(
                    new THREE.BoxGeometry(0.06, 0.4, 0.06),
                    mesaMat
                );
                pataMesa.position.set(i * 0.6, baseY + 0.2, centroZ + 0.3 + j * 0.28);
                grupo.add(pataMesa);
            }
        }

        // Adorno sobre la mesa (libro)
        const libro = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.03, 0.2),
            new THREE.MeshStandardMaterial({ color: 0xC0392B, roughness: 0.7 })
        );
        libro.position.set(-0.2, baseY + 0.45, centroZ + 0.3);
        grupo.add(libro);

        const libro2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.03, 0.18),
            new THREE.MeshStandardMaterial({ color: 0x2980B9, roughness: 0.7 })
        );
        libro2.position.set(-0.2, baseY + 0.48, centroZ + 0.3);
        grupo.add(libro2);

        // ------------------------------------------------------------
        // TV EN LA PARED TRASERA (frente al sofá)
        // ------------------------------------------------------------
        const tvMarcoMat = new THREE.MeshStandardMaterial({
            color: 0x111111, metalness: 0.7, roughness: 0.4
        });
        const tvMarco = new THREE.Mesh(
            new THREE.BoxGeometry(2.0, 1.2, 0.08),
            tvMarcoMat
        );
        tvMarco.position.set(0, baseY + 1.5, centroZ - 3.9);
        grupo.add(tvMarco);

        const tvPantalla = new THREE.Mesh(
            new THREE.PlaneGeometry(1.9, 1.1),
            new THREE.MeshStandardMaterial({
                color: 0x0A0A0A, emissive: 0x1A1A3A, emissiveIntensity: 0.4
            })
        );
        tvPantalla.position.set(0, baseY + 1.5, centroZ - 3.85);
        grupo.add(tvPantalla);

        // Mueble bajo la TV
        const muebleMat = new THREE.MeshStandardMaterial({
            color: 0x2C2C2C, roughness: 0.7, metalness: 0.2
        });
        const mueble = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.5, 0.4),
            muebleMat
        );
        mueble.position.set(0, baseY + 0.25, centroZ - 3.7);
        mueble.castShadow = true;
        mueble.receiveShadow = true;
        grupo.add(mueble);

        // ------------------------------------------------------------
        // PLANTA GRANDE EN UNA ESQUINA
        // ------------------------------------------------------------
        const macetaGrandeMat = new THREE.MeshStandardMaterial({
            color: 0xB06A2A, roughness: 0.9
        });
        const macetaGrande = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.25, 0.5, 16),
            macetaGrandeMat
        );
        macetaGrande.position.set(-3.3, baseY + 0.25, centroZ - 3.2);
        macetaGrande.castShadow = true;
        grupo.add(macetaGrande);

        const plantaGrandeMat = new THREE.MeshStandardMaterial({
            color: 0x2E7D32, roughness: 0.9
        });
        for (let i = 0; i < 8; i++) {
            const hoja = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 6, 6),
                plantaGrandeMat
            );
            const angulo = (i / 8) * Math.PI * 2;
            hoja.position.set(
                -3.3 + Math.cos(angulo) * 0.2,
                baseY + 0.7 + Math.random() * 0.3,
                centroZ - 3.2 + Math.sin(angulo) * 0.2
            );
            hoja.scale.set(1, 0.7, 1);
            hoja.castShadow = true;
            grupo.add(hoja);
        }

        // ------------------------------------------------------------
        // CUADRO DECORATIVO EN LA PARED IZQUIERDA
        // ------------------------------------------------------------
        const cuadroMarco = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.7, 0.9),
            new THREE.MeshStandardMaterial({ color: 0x1A1A1A, metalness: 0.6, roughness: 0.4 })
        );
        cuadroMarco.position.set(-3.88, baseY + 1.7, centroZ - 1.5);
        grupo.add(cuadroMarco);

        const cuadroLienzo = new THREE.Mesh(
            new THREE.PlaneGeometry(0.85, 0.65),
            new THREE.MeshStandardMaterial({ color: 0x5DADE2, roughness: 0.9 })
        );
        cuadroLienzo.rotation.y = Math.PI / 2;
        cuadroLienzo.position.set(-3.85, baseY + 1.7, centroZ - 1.5);
        grupo.add(cuadroLienzo);
    }

    // ============================================================
    // BALCÓN ABIERTO (adosado al frente del PH)
    // ============================================================
    _crearBalconAbierto(grupo, matConcreto) {
        const anchoBalcon = 8;
        const profundidadBalcon = 4;
        const centroZ = 4 + profundidadBalcon / 2;  // z = 6
        const baseY = ALTURA_PISO;
        const alturaTecho = 2.8;

        // ------------------------------------------------------------
        // PLATAFORMA DEL BALCÓN
        // ------------------------------------------------------------
        const plataforma = new THREE.Mesh(
            new THREE.BoxGeometry(anchoBalcon, 0.3, profundidadBalcon),
            matConcreto
        );
        plataforma.position.set(0, baseY - 0.15, centroZ);
        plataforma.castShadow = true;
        plataforma.receiveShadow = true;
        grupo.add(plataforma);

        // Piso del balcón (madera)
        const texturaPiso = crearTexturaMadera();
        const pisoMat = new THREE.MeshStandardMaterial({
            map: texturaPiso, roughness: 0.7, metalness: 0.05
        });
        const piso = new THREE.Mesh(
            new THREE.PlaneGeometry(anchoBalcon, profundidadBalcon),
            pisoMat
        );
        piso.rotation.x = -Math.PI / 2;
        piso.position.set(0, baseY, centroZ);
        piso.receiveShadow = true;
        grupo.add(piso);

        // ------------------------------------------------------------
        // TECHO DEL BALCÓN
        // ------------------------------------------------------------
        const techoMat = new THREE.MeshStandardMaterial({
            color: 0xF5F5F0, roughness: 0.9
        });
        const techo = new THREE.Mesh(
            new THREE.BoxGeometry(anchoBalcon, 0.2, profundidadBalcon),
            techoMat
        );
        techo.position.set(0, baseY + alturaTecho, centroZ);
        techo.castShadow = true;
        grupo.add(techo);

        // ------------------------------------------------------------
        // PARED LATERAL DERECHA DEL BALCÓN (donde irán los sliders)
        // Esta es una pared sólida de concreto, importante para el panel
        // ------------------------------------------------------------
        const paredLateralDer = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, alturaTecho, profundidadBalcon),
            matConcreto
        );
        paredLateralDer.position.set(anchoBalcon / 2, baseY + alturaTecho / 2, centroZ);
        paredLateralDer.castShadow = true;
        paredLateralDer.receiveShadow = true;
        grupo.add(paredLateralDer);

        // ------------------------------------------------------------
        // BARANDILLA DE CRISTAL (frontal + lateral izquierdo)
        // ------------------------------------------------------------
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x2C2C2C, metalness: 0.95, roughness: 0.15
        });
        const cristalMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xFFFFFF, metalness: 0, roughness: 0.05,
            transmission: 0.9, transparent: true, opacity: 0.25,
            ior: 1.5, thickness: 0.1
        });

        const alturaBarandilla = 1.1;

        // Barandilla frontal (frente al balcón, mirando a la ciudad)
        const zFrontal = centroZ + profundidadBalcon / 2;

        for (let i = 0; i <= 6; i++) {
            const x = -anchoBalcon / 2 + (i / 6) * anchoBalcon;
            const poste = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, alturaBarandilla, 12),
                metalMaterial
            );
            poste.position.set(x, baseY + alturaBarandilla / 2, zFrontal);
            poste.castShadow = true;
            grupo.add(poste);
        }

        const panelFrontal = new THREE.Mesh(
            new THREE.BoxGeometry(anchoBalcon - 0.3, alturaBarandilla - 0.15, 0.02),
            cristalMaterial
        );
        panelFrontal.position.set(0, baseY + alturaBarandilla / 2, zFrontal);
        grupo.add(panelFrontal);

        const pasamanosFrontal = new THREE.Mesh(
            new THREE.BoxGeometry(anchoBalcon, 0.06, 0.06),
            metalMaterial
        );
        pasamanosFrontal.position.set(0, baseY + alturaBarandilla, zFrontal);
        pasamanosFrontal.castShadow = true;
        grupo.add(pasamanosFrontal);

        // Barandilla lateral izquierda
        const xLateral = -anchoBalcon / 2;

        for (let i = 0; i <= 3; i++) {
            const z = centroZ - profundidadBalcon / 2 + (i / 3) * profundidadBalcon;
            const poste = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, alturaBarandilla, 12),
                metalMaterial
            );
            poste.position.set(xLateral, baseY + alturaBarandilla / 2, z);
            poste.castShadow = true;
            grupo.add(poste);
        }

        const panelLateral = new THREE.Mesh(
            new THREE.BoxGeometry(0.02, alturaBarandilla - 0.15, profundidadBalcon - 0.2),
            cristalMaterial
        );
        panelLateral.position.set(xLateral, baseY + alturaBarandilla / 2, centroZ);
        grupo.add(panelLateral);

        const pasamanosLateral = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.06, profundidadBalcon),
            metalMaterial
        );
        pasamanosLateral.position.set(xLateral, baseY + alturaBarandilla, centroZ);
        pasamanosLateral.castShadow = true;
        grupo.add(pasamanosLateral);

        // ------------------------------------------------------------
        // ILUMINACIÓN EXTERIOR DEL BALCÓN (2 lámparas de techo)
        // ------------------------------------------------------------
        for (let lado = -1; lado <= 1; lado += 2) {
            const lamparaCaja = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.1, 0.4),
                new THREE.MeshStandardMaterial({
                    color: 0x333333, metalness: 0.7, roughness: 0.4
                })
            );
            lamparaCaja.position.set(lado * 2.5, baseY + alturaTecho - 0.1, centroZ);
            grupo.add(lamparaCaja);

            const foco = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.MeshStandardMaterial({
                    color: 0xFFF8E0, emissive: 0xFFE0A0, emissiveIntensity: 1.2
                })
            );
            foco.position.set(lado * 2.5, baseY + alturaTecho - 0.2, centroZ);
            grupo.add(foco);

            const luzBalcon = new THREE.PointLight(0xFFE0A0, 0.6, 8, 2);
            luzBalcon.position.set(lado * 2.5, baseY + alturaTecho - 0.3, centroZ);
            grupo.add(luzBalcon);
        }

        // ------------------------------------------------------------
        // MESA FÍSICA DEL BALCÓN (donde se apoyará la mesa de fuerzas)
        // Ubicada en el centro del balcón, ligeramente hacia adelante
        // ------------------------------------------------------------
        this._crearMesaFisicaBalcon(grupo, baseY, centroZ - 0.5);

        // ------------------------------------------------------------
        // DETALLES DEL BALCÓN: macetas en las esquinas + silla
        // ------------------------------------------------------------
        this._crearDetallesBalconNuevo(grupo, baseY, centroZ, anchoBalcon, profundidadBalcon);
    }

    // ============================================================
    // MESA FÍSICA DEL BALCÓN
    // ============================================================
    _crearMesaFisicaBalcon(grupo, baseY, zMesa) {
        const texturaMaderaOscura = crearTexturaMaderaOscura();
        const superficieMat = new THREE.MeshStandardMaterial({
            map: texturaMaderaOscura, roughness: 0.5, metalness: 0.15
        });

        // Superficie (2 x 1.4 m)
        const superficie = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.08, 1.4),
            superficieMat
        );
        superficie.position.set(0, baseY + 0.8, zMesa);
        superficie.castShadow = true;
        superficie.receiveShadow = true;
        grupo.add(superficie);

        const pataMat = new THREE.MeshStandardMaterial({
            color: 0x3A1F0A, roughness: 0.6, metalness: 0.2
        });

        // 4 patas
        const posicionesPatas = [
            [-0.9, -0.6], [0.9, -0.6], [-0.9, 0.6], [0.9, 0.6]
        ];
        posicionesPatas.forEach(pos => {
            const pata = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.8, 0.08),
                pataMat
            );
            pata.position.set(pos[0], baseY + 0.4, zMesa + pos[1]);
            pata.castShadow = true;
            pata.receiveShadow = true;
            grupo.add(pata);
        });

        // Travesaños
        for (let lado = -1; lado <= 1; lado += 2) {
            const travesaño = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.05, 0.05),
                pataMat
            );
            travesaño.position.set(0, baseY + 0.4, zMesa + lado * 0.6);
            travesaño.castShadow = true;
            grupo.add(travesaño);
        }
    }

    // ============================================================
    // DETALLES DEL BALCÓN (macetas en esquinas, silla)
    // ============================================================
    _crearDetallesBalconNuevo(grupo, baseY, centroZ, anchoBalcon, profundidadBalcon) {
        const macetaMat = new THREE.MeshStandardMaterial({
            color: 0x8B4513, roughness: 0.9
        });
        const plantaMat = new THREE.MeshStandardMaterial({
            color: 0x2E7D32, roughness: 0.9
        });

        // Dos macetas en las esquinas frontales del balcón
        const esquinas = [
            [-anchoBalcon / 2 + 0.5, centroZ + profundidadBalcon / 2 - 0.5],
            [-anchoBalcon / 2 + 0.5, centroZ - profundidadBalcon / 2 + 0.5]
        ];

        esquinas.forEach(pos => {
            const maceta = new THREE.Mesh(
                new THREE.CylinderGeometry(0.18, 0.15, 0.35, 12),
                macetaMat
            );
            maceta.position.set(pos[0], baseY + 0.175, pos[1]);
            maceta.castShadow = true;
            grupo.add(maceta);

            for (let i = 0; i < 5; i++) {
                const hoja = new THREE.Mesh(
                    new THREE.SphereGeometry(0.12, 6, 6),
                    plantaMat
                );
                hoja.position.set(
                    pos[0] + (Math.random() - 0.5) * 0.2,
                    baseY + 0.5 + Math.random() * 0.2,
                    pos[1] + (Math.random() - 0.5) * 0.2
                );
                hoja.castShadow = true;
                grupo.add(hoja);
            }
        });

        // Silla pequeña en la esquina lateral izquierda
        const sillaMat = new THREE.MeshStandardMaterial({
            color: 0x5C3A1E, roughness: 0.7
        });
        const sillaAsiento = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.05, 0.45),
            sillaMat
        );
        sillaAsiento.position.set(-anchoBalcon / 2 + 0.8, baseY + 0.45, centroZ - profundidadBalcon / 2 + 0.8);
        sillaAsiento.castShadow = true;
        grupo.add(sillaAsiento);

        for (let i = -1; i <= 1; i += 2) {
            for (let j = -1; j <= 1; j += 2) {
                const pata = new THREE.Mesh(
                    new THREE.BoxGeometry(0.04, 0.45, 0.04),
                    sillaMat
                );
                pata.position.set(
                    -anchoBalcon / 2 + 0.8 + i * 0.18,
                    baseY + 0.22,
                    centroZ - profundidadBalcon / 2 + 0.8 + j * 0.18
                );
                grupo.add(pata);
            }
        }
    }

   // ============================================================
    // CALLE PRINCIPAL Y CRUCE — DISEÑO URBANO COHERENTE
    // ============================================================
    _crearCalle() {
        const grupo = new THREE.Group();

        // ------------------------------------------------------------
        // SUELO URBANO: base grande para que toda la ciudad se apoye
        // ------------------------------------------------------------
        const texturaAsfaltoBase = crearTexturaAsfalto();
        const sueloUrbanoMat = new THREE.MeshStandardMaterial({
            map: texturaAsfaltoBase,
            color: 0x9A9A9A,  // Gris claro (antes era muy oscuro)
            roughness: 0.95,
            metalness: 0.05
        });
        const sueloUrbano = new THREE.Mesh(
            new THREE.PlaneGeometry(600, 600),
            sueloUrbanoMat
        );
        sueloUrbano.rotation.x = -Math.PI / 2;
        sueloUrbano.position.set(0, -0.05, 0);
        sueloUrbano.receiveShadow = true;
        grupo.add(sueloUrbano);

        // ------------------------------------------------------------
        // CALLE PRINCIPAL (eje Z, al frente del PH)
        // Centrada en z=25, largo 400 (llega hasta la niebla), ancho 24
        // Va desde z=-175 hasta z=225
        // ------------------------------------------------------------
        const texturaAsfalto = crearTexturaAsfalto();
        const calleMat = new THREE.MeshStandardMaterial({
            map: texturaAsfalto, roughness: 0.85, metalness: 0.1
        });

        const callePrincipal = new THREE.Mesh(
            new THREE.PlaneGeometry(24, 400),
            calleMat
        );
        callePrincipal.rotation.x = -Math.PI / 2;
        callePrincipal.position.set(0, 0.01, 25);
        callePrincipal.receiveShadow = true;
        grupo.add(callePrincipal);

        // ------------------------------------------------------------
        // CALLE PERPENDICULAR (cruce, eje X)
        // Centrada en z=30, largo 400, ancho 20
        // ------------------------------------------------------------
        const callePerp = new THREE.Mesh(
            new THREE.PlaneGeometry(400, 20),
            calleMat
        );
        callePerp.rotation.x = -Math.PI / 2;
        callePerp.position.set(0, 0.01, 30);
        callePerp.receiveShadow = true;
        grupo.add(callePerp);

        // ------------------------------------------------------------
        // ACERAS (a los lados de la calle principal)
        // ------------------------------------------------------------
        const texturaAcera = crearTexturaAcera();
        const aceraMat = new THREE.MeshStandardMaterial({
            map: texturaAcera, roughness: 0.95, metalness: 0.05
        });

        const aceraIzq = new THREE.Mesh(
            new THREE.PlaneGeometry(8, 400),
            aceraMat
        );
        aceraIzq.rotation.x = -Math.PI / 2;
        aceraIzq.position.set(-16, 0.02, 25);
        aceraIzq.receiveShadow = true;
        grupo.add(aceraIzq);

        const aceraDer = new THREE.Mesh(
            new THREE.PlaneGeometry(8, 400),
            aceraMat
        );
        aceraDer.rotation.x = -Math.PI / 2;
        aceraDer.position.set(16, 0.02, 25);
        aceraDer.receiveShadow = true;
        grupo.add(aceraDer);

        // Aceras laterales del cruce
        const aceraCruceArriba = new THREE.Mesh(
            new THREE.PlaneGeometry(400, 6),
            aceraMat
        );
        aceraCruceArriba.rotation.x = -Math.PI / 2;
        aceraCruceArriba.position.set(0, 0.02, 17);
        aceraCruceArriba.receiveShadow = true;
        grupo.add(aceraCruceArriba);

        const aceraCruceAbajo = new THREE.Mesh(
            new THREE.PlaneGeometry(400, 6),
            aceraMat
        );
        aceraCruceAbajo.rotation.x = -Math.PI / 2;
        aceraCruceAbajo.position.set(0, 0.02, 43);
        aceraCruceAbajo.receiveShadow = true;
        grupo.add(aceraCruceAbajo);

        // ------------------------------------------------------------
        // BORDILLOS
        // ------------------------------------------------------------
        const bordilloMat = new THREE.MeshStandardMaterial({
            color: 0xCCCCCC, roughness: 0.9, metalness: 0.05
        });

        const bordilloIzq = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.3, 400),
            bordilloMat
        );
        bordilloIzq.position.set(-12, 0.15, 25);
        bordilloIzq.castShadow = true;
        bordilloIzq.receiveShadow = true;
        grupo.add(bordilloIzq);

        const bordilloDer = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.3, 400),
            bordilloMat
        );
        bordilloDer.position.set(12, 0.15, 25);
        bordilloDer.castShadow = true;
        bordilloDer.receiveShadow = true;
        grupo.add(bordilloDer);

        // ------------------------------------------------------------
        // LÍNEAS VIALES
        // ------------------------------------------------------------
        const lineaMat = new THREE.MeshStandardMaterial({
            color: 0xFFD700, roughness: 0.8, transparent: true, opacity: 0.85
        });

        // Línea central doble (calle principal)
        for (let z = -170; z < 220; z += 4) {
            const linea1 = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 2.5), lineaMat);
            linea1.rotation.x = -Math.PI / 2;
            linea1.position.set(-0.3, 0.02, z);
            grupo.add(linea1);

            const linea2 = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 2.5), lineaMat);
            linea2.rotation.x = -Math.PI / 2;
            linea2.position.set(0.3, 0.02, z);
            grupo.add(linea2);
        }

        // Líneas discontinuas de carril (calle principal)
        for (let lado = -1; lado <= 1; lado += 2) {
            for (let z = -170; z < 220; z += 5) {
                const linea = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 1.8), lineaMat);
                linea.rotation.x = -Math.PI / 2;
                linea.position.set(lado * 5.5, 0.02, z);
                grupo.add(linea);
            }
        }

        // Líneas centrales del cruce (eje X)
        for (let x = -195; x < 195; x += 4) {
            const linea = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.15), lineaMat);
            linea.rotation.x = -Math.PI / 2;
            linea.position.set(x, 0.02, 30);
            grupo.add(linea);
        }

        // ------------------------------------------------------------
        // PASO DE CEBRA
        // ------------------------------------------------------------
        const cebraMat = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF, roughness: 0.7
        });

        // Cebra arriba del cruce
        for (let i = 0; i < 6; i++) {
            const cebra = new THREE.Mesh(
                new THREE.PlaneGeometry(0.6, 3),
                cebraMat
            );
            cebra.rotation.x = -Math.PI / 2;
            cebra.position.set(-8 + i * 2.8, 0.03, 21);
            grupo.add(cebra);
        }

        // Cebra abajo del cruce
        for (let i = 0; i < 6; i++) {
            const cebra = new THREE.Mesh(
                new THREE.PlaneGeometry(0.6, 3),
                cebraMat
            );
            cebra.rotation.x = -Math.PI / 2;
            cebra.position.set(-8 + i * 2.8, 0.03, 39);
            grupo.add(cebra);
        }

        this.scene.add(grupo);
        this.grupoCalle = grupo;
    }

     // ============================================================
    // CIUDAD EN CUADRÍCULA — SIN ATRAVESAR CALLES NI EL PH
    // ============================================================
    _crearCiudadEnCuadricula() {
        const grupo = new THREE.Group();
        const texturaAzotea = crearTexturaAzotea();

        const coloresEdificios = [
            '#A9A9A9', '#8B8B8B', '#778899', '#696969',
            '#D3D3D3', '#C0C0C0', '#B0C4DE', '#708090'
        ];

        const tamanoManzana = 30;
        const anchoCalle = 20;
        const paso = tamanoManzana + anchoCalle;  // 50 m

        const rangoManzanas = 6;

        for (let mz = -rangoManzanas; mz <= rangoManzanas; mz++) {
            for (let mx = -rangoManzanas; mx <= rangoManzanas; mx++) {
                const centroX = mx * paso;
                const centroZ = mz * paso;

                // ------------------------------------------------------------
                // FILTROS DE EXCLUSIÓN
                // ------------------------------------------------------------
                // 1. Zona del PH (edificio principal + alrededores)
                if (Math.abs(centroX) < 30 && Math.abs(centroZ) < 30) continue;

                // 2. Calle principal (z = 25, ancho 24) + aceras + margen
                //    Excluir toda la franja: z entre -5 y 55
                if (centroZ > -5 && centroZ < 55) continue;

                // 3. Calle perpendicular (z = 30, ancho 20) + aceras + margen
                //    Ya cubierta por el filtro 2.

                // 4. Calle perpendicular en el eje X: no hay límite, se extiende
                //    hasta donde llegue el suelo urbano.

                // 5. No generar manzanas muy lejanas (para no saturar)
                if (Math.abs(centroX) > 250) continue;
                if (Math.abs(centroZ) > 250) continue;

                const edificiosPorManzana = 2 + Math.floor(Math.random() * 2);

                for (let e = 0; e < edificiosPorManzana; e++) {
                    const ancho = 6 + Math.random() * 5;
                    const profundidad = 6 + Math.random() * 5;
                    const altura = 20 + Math.random() * 50;

                    const offsetX = (Math.random() - 0.5) * (tamanoManzana - ancho - 4);
                    const offsetZ = (Math.random() - 0.5) * (tamanoManzana - profundidad - 4);

                    const numVentanasX = Math.max(3, Math.floor(ancho / 1.5));
                    const numVentanasY = Math.max(6, Math.floor(altura / 3));
                    const colorBase = coloresEdificios[Math.floor(Math.random() * coloresEdificios.length)];

                    const texturaFachada = crearTexturaFachada(colorBase, numVentanasX, numVentanasY);

                    const matFachada = new THREE.MeshStandardMaterial({
                        map: texturaFachada, roughness: 0.85, metalness: 0.1
                    });
                    const matAzotea = new THREE.MeshStandardMaterial({
                        map: texturaAzotea, roughness: 0.95, metalness: 0.05
                    });

                    const materiales = [
                        matFachada, matFachada,
                        matAzotea, matAzotea,
                        matFachada, matFachada
                    ];

                    const edificio = new THREE.Mesh(
                        new THREE.BoxGeometry(ancho, altura, profundidad),
                        materiales
                    );

                    edificio.position.set(
                        centroX + offsetX,
                        altura / 2,
                        centroZ + offsetZ
                    );
                    edificio.castShadow = true;
                    edificio.receiveShadow = true;
                    grupo.add(edificio);

                    this._crearDetallesAzotea(grupo, edificio.position.x, altura, edificio.position.z, ancho, profundidad);
                }
            }
        }

        this.scene.add(grupo);
    }
 // ============================================================
    // DETALLES DE AZOTEA (barandilla, antenas, tanques)
    // ============================================================
    _crearDetallesAzotea(grupo, x, altura, z, ancho, profundidad) {
        // Barandilla de la azotea (marco delgado)
        const barandillaMat = new THREE.MeshStandardMaterial({
            color: 0x555555, metalness: 0.6, roughness: 0.5
        });

        // Marco delgado alrededor de la azotea
        const grosor = 0.15;
        const alturaBarandilla = 0.5;

        // 4 lados
        const lados = [
            { w: ancho, d: grosor, dx: 0, dz: -profundidad / 2 + grosor / 2 },
            { w: ancho, d: grosor, dx: 0, dz: profundidad / 2 - grosor / 2 },
            { w: grosor, d: profundidad, dx: -ancho / 2 + grosor / 2, dz: 0 },
            { w: grosor, d: profundidad, dx: ancho / 2 - grosor / 2, dz: 0 }
        ];

        lados.forEach(l => {
            const barra = new THREE.Mesh(
                new THREE.BoxGeometry(l.w, alturaBarandilla, l.d),
                barandillaMat
            );
            barra.position.set(x + l.dx, altura + alturaBarandilla / 2, z + l.dz);
            grupo.add(barra);
        });

        // Ocasionalmente un tanque de agua o antena
        if (Math.random() < 0.4) {
            const tanque = new THREE.Mesh(
                new THREE.CylinderGeometry(0.8, 0.8, 1.5, 12),
                new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7, roughness: 0.4 })
            );
            tanque.position.set(
                x + (Math.random() - 0.5) * (ancho - 2),
                altura + 0.75,
                z + (Math.random() - 0.5) * (profundidad - 2)
            );
            tanque.castShadow = true;
            grupo.add(tanque);
        }

        if (Math.random() < 0.3) {
            const antena = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 3, 6),
                new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 })
            );
            antena.position.set(
                x + (Math.random() - 0.5) * (ancho - 1),
                altura + 1.5,
                z + (Math.random() - 0.5) * (profundidad - 1)
            );
            grupo.add(antena);
        }
    }
    // ============================================================
    // AMBIENTE (árboles, farolas, bancas)
    // ============================================================
    _crearAmbiente() {
        const grupo = new THREE.Group();

        for (let i = 0; i < 24; i++) {
            for (let lado = -1; lado <= 1; lado += 2) {
                const x = lado * 15;
                const z = -60 + i * 10 + Math.random() * 3;
                if (Math.abs(z - 40) < 8) continue;
                const arbol = this._crearArbol();
                arbol.position.set(x, 0.3, z);
                grupo.add(arbol);
            }
        }

        for (let i = 0; i < 18; i++) {
            for (let lado = -1; lado <= 1; lado += 2) {
                const x = lado * 13;
                const z = -60 + i * 12;
                if (Math.abs(z - 40) < 8) continue;
                const farola = this._crearFarola();
                farola.position.set(x, 0.3, z);
                grupo.add(farola);
            }
        }

        for (let i = 0; i < 12; i++) {
            for (let lado = -1; lado <= 1; lado += 2) {
                const x = lado * 16;
                const z = -40 + i * 14;
                if (Math.abs(z - 40) < 10) continue;
                const banca = this._crearBanca();
                banca.position.set(x, 0.3, z);
                banca.rotation.y = lado > 0 ? -Math.PI / 2 : Math.PI / 2;
                grupo.add(banca);
            }
        }

        this.scene.add(grupo);
    }

    _crearArbol() {
        const grupo = new THREE.Group();

        const tronco = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.2, 2.5, 8),
            new THREE.MeshStandardMaterial({ color: 0x5C3A1E, roughness: 0.95 })
        );
        tronco.position.y = 1.25;
        tronco.castShadow = true;
        grupo.add(tronco);

        const follajeMat = new THREE.MeshStandardMaterial({
            color: 0x2E7D32, roughness: 0.9
        });

        [
            { pos: [0, 2.8, 0], radio: 1.2 },
            { pos: [0.6, 2.5, 0.3], radio: 0.9 },
            { pos: [-0.5, 2.6, -0.4], radio: 1.0 }
        ].forEach(f => {
            const follaje = new THREE.Mesh(
                new THREE.SphereGeometry(f.radio, 8, 8),
                follajeMat
            );
            follaje.position.set(...f.pos);
            follaje.castShadow = true;
            grupo.add(follaje);
        });

        return grupo;
    }

    _crearFarola() {
        const grupo = new THREE.Group();
        const metalMat = new THREE.MeshStandardMaterial({
            color: 0x2A2A2A, metalness: 0.8, roughness: 0.3
        });

        const poste = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.08, 4, 8),
            metalMat
        );
        poste.position.y = 2;
        poste.castShadow = true;
        grupo.add(poste);

        const brazo = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 1, 8),
            metalMat
        );
        brazo.rotation.z = Math.PI / 2.5;
        brazo.position.set(0.4, 4, 0);
        grupo.add(brazo);

        const luminaria = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 12, 12),
            new THREE.MeshStandardMaterial({
                color: 0xFFF5CC, emissive: 0xFFE080, emissiveIntensity: 0.6
            })
        );
        luminaria.position.set(0.8, 3.85, 0);
        grupo.add(luminaria);

        const luz = new THREE.PointLight(0xFFE080, 0.3, 8, 2);
        luz.position.set(0.8, 3.85, 0);
        grupo.add(luz);

        return grupo;
    }

    _crearBanca() {
        const grupo = new THREE.Group();
        const maderaMat = new THREE.MeshStandardMaterial({ color: 0x8B6F47, roughness: 0.8 });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x2A2A2A, metalness: 0.7, roughness: 0.4 });

        const asiento = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.5), maderaMat);
        asiento.position.y = 0.5;
        asiento.castShadow = true;
        grupo.add(asiento);

        const respaldo = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 0.06), maderaMat);
        respaldo.position.set(0, 0.8, -0.22);
        respaldo.castShadow = true;
        grupo.add(respaldo);

        for (let lado = -1; lado <= 1; lado += 2) {
            const pata = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.5), metalMat);
            pata.position.set(lado * 0.65, 0.25, 0);
            pata.castShadow = true;
            grupo.add(pata);
        }

        return grupo;
    }

    // ============================================================
    // AUTOS
    // ============================================================
    _crearAuto(tipo, color) {
        const grupo = new THREE.Group();
        const colorNum = new THREE.Color(color);

        const carroceriaMat = new THREE.MeshStandardMaterial({
            color: colorNum, roughness: 0.3, metalness: 0.7
        });

        const vidrioMat = new THREE.MeshStandardMaterial({
            color: 0x1A1A2A, roughness: 0.05, metalness: 0.5,
            transparent: true, opacity: 0.7
        });

        const llantaMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95 });
        const rinMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.9, roughness: 0.2 });
        const luzDelanteraMat = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF, emissive: 0xFFF5CC, emissiveIntensity: 0.8
        });
        const luzTraseraMat = new THREE.MeshStandardMaterial({
            color: 0xFF2222, emissive: 0xFF0000, emissiveIntensity: 0.8
        });

        let largoTotal, anchoTotal, altoChasis;

        if (tipo === 'sedan') {
            largoTotal = 4.2; anchoTotal = 1.8; altoChasis = 0.6;

            const chasis = new THREE.Mesh(new THREE.BoxGeometry(anchoTotal, altoChasis, largoTotal), carroceriaMat);
            chasis.position.y = altoChasis / 2 + 0.25;
            chasis.castShadow = true;
            grupo.add(chasis);

            const capo = new THREE.Mesh(new THREE.BoxGeometry(anchoTotal * 0.95, 0.15, largoTotal * 0.3), carroceriaMat);
            capo.position.set(0, altoChasis + 0.25 + 0.05, largoTotal / 2 - largoTotal * 0.15);
            capo.castShadow = true;
            grupo.add(capo);

            const cabina = new THREE.Mesh(new THREE.BoxGeometry(anchoTotal * 0.85, 0.6, largoTotal * 0.4), vidrioMat);
            cabina.position.set(0, altoChasis + 0.25 + 0.3, -0.1);
            cabina.castShadow = true;
            grupo.add(cabina);

            const techo = new THREE.Mesh(new THREE.BoxGeometry(anchoTotal * 0.85, 0.05, largoTotal * 0.4), carroceriaMat);
            techo.position.set(0, altoChasis + 0.25 + 0.6, -0.1);
            grupo.add(techo);

            const baul = new THREE.Mesh(new THREE.BoxGeometry(anchoTotal * 0.95, 0.2, largoTotal * 0.25), carroceriaMat);
            baul.position.set(0, altoChasis + 0.25, -largoTotal / 2 + largoTotal * 0.12);
            baul.castShadow = true;
            grupo.add(baul);

        } else if (tipo === 'camioneta') {
            largoTotal = 4.5; anchoTotal = 2.0; altoChasis = 0.9;

            const chasis = new THREE.Mesh(new THREE.BoxGeometry(anchoTotal, altoChasis, largoTotal), carroceriaMat);
            chasis.position.y = altoChasis / 2 + 0.3;
            chasis.castShadow = true;
            grupo.add(chasis);

            const cabina = new THREE.Mesh(new THREE.BoxGeometry(anchoTotal * 0.9, 0.7, largoTotal * 0.35), vidrioMat);
            cabina.position.set(0, altoChasis + 0.3 + 0.35, largoTotal * 0.15);
            cabina.castShadow = true;
            grupo.add(cabina);

            const techo = new THREE.Mesh(new THREE.BoxGeometry(anchoTotal * 0.9, 0.05, largoTotal * 0.35), carroceriaMat);
            techo.position.set(0, altoChasis + 0.3 + 0.7, largoTotal * 0.15);
            grupo.add(techo);

            const cajaCarga = new THREE.Mesh(new THREE.BoxGeometry(anchoTotal * 0.95, 0.7, largoTotal * 0.5), carroceriaMat);
            cajaCarga.position.set(0, altoChasis + 0.3 + 0.35, -largoTotal * 0.2);
            cajaCarga.castShadow = true;
            grupo.add(cajaCarga);

        } else {
            largoTotal = 5.5; anchoTotal = 2.2; altoChasis = 1.0;

            const chasis = new THREE.Mesh(new THREE.BoxGeometry(anchoTotal, altoChasis, largoTotal), carroceriaMat);
            chasis.position.y = altoChasis / 2 + 0.35;
            chasis.castShadow = true;
            grupo.add(chasis);

            const cabina = new THREE.Mesh(new THREE.BoxGeometry(anchoTotal * 0.9, 0.9, largoTotal * 0.25), vidrioMat);
            cabina.position.set(0, altoChasis + 0.35 + 0.45, largoTotal * 0.3);
            cabina.castShadow = true;
            grupo.add(cabina);

            const techoCabina = new THREE.Mesh(new THREE.BoxGeometry(anchoTotal * 0.9, 0.05, largoTotal * 0.25), carroceriaMat);
            techoCabina.position.set(0, altoChasis + 0.35 + 0.9, largoTotal * 0.3);
            grupo.add(techoCabina);

            const contenedor = new THREE.Mesh(
                new THREE.BoxGeometry(anchoTotal, altoChasis + 0.6, largoTotal * 0.6),
                new THREE.MeshStandardMaterial({ color: 0xDDDDDD, roughness: 0.7, metalness: 0.2 })
            );
            contenedor.position.set(0, (altoChasis + 0.6) / 2 + 0.35, -largoTotal * 0.15);
            contenedor.castShadow = true;
            grupo.add(contenedor);
        }

        const radioRueda = tipo === 'sedan' ? 0.32 : (tipo === 'camioneta' ? 0.38 : 0.45);
        const anchoRueda = 0.2;

        [
            [-anchoTotal / 2 - 0.02, radioRueda, largoTotal / 2 - 0.8],
            [anchoTotal / 2 + 0.02, radioRueda, largoTotal / 2 - 0.8],
            [-anchoTotal / 2 - 0.02, radioRueda, -largoTotal / 2 + 0.8],
            [anchoTotal / 2 + 0.02, radioRueda, -largoTotal / 2 + 0.8]
        ].forEach(pos => {
            const llanta = new THREE.Mesh(
                new THREE.CylinderGeometry(radioRueda, radioRueda, anchoRueda, 16),
                llantaMat
            );
            llanta.rotation.z = Math.PI / 2;
            llanta.position.set(pos[0], pos[1], pos[2]);
            llanta.castShadow = true;
            grupo.add(llanta);

            const rin = new THREE.Mesh(
                new THREE.CylinderGeometry(radioRueda * 0.6, radioRueda * 0.6, anchoRueda + 0.02, 12),
                rinMat
            );
            rin.rotation.z = Math.PI / 2;
            rin.position.set(pos[0], pos[1], pos[2]);
            grupo.add(rin);
        });

        for (let lado = -1; lado <= 1; lado += 2) {
            const luzDel = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), luzDelanteraMat);
            luzDel.position.set(lado * anchoTotal * 0.3, altoChasis + 0.15, largoTotal / 2 + 0.02);
            grupo.add(luzDel);

            const luzTra = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.05), luzTraseraMat);
            luzTra.position.set(lado * anchoTotal * 0.35, altoChasis + 0.15, -largoTotal / 2 - 0.02);
            grupo.add(luzTra);

            const espejo = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), carroceriaMat);
            espejo.position.set(lado * (anchoTotal / 2 + 0.06), altoChasis + 0.4, largoTotal * 0.2);
            grupo.add(espejo);
        }

        return grupo;
    }

    // ============================================================
    // TRÁFICO
    // ============================================================
    _crearTrafico() {
        const coloresAutos = [
            '#FF0000', '#0000FF', '#FFFFFF', '#000000', '#FFFF00',
            '#00FF00', '#FF00FF', '#FFA500', '#C0C0C0', '#8B0000',
            '#008080', '#800080', '#FF6347', '#4169E1', '#2F4F4F'
        ];
        const tiposAutos = ['sedan', 'sedan', 'sedan', 'camioneta', 'camion'];

        const carriles = [
            { x: -7.5, direccion: 1, velocidadBase: 7 },
            { x: -2.5, direccion: 1, velocidadBase: 5 },
            { x: 2.5, direccion: -1, velocidadBase: 5 },
            { x: 7.5, direccion: -1, velocidadBase: 7 }
        ];

        const zMin = -170;
        const zMax = 220;

        for (let i = 0; i < 36; i++) {
            const carril = carriles[i % 4];
            const tipo = tiposAutos[Math.floor(Math.random() * tiposAutos.length)];
            const color = coloresAutos[Math.floor(Math.random() * coloresAutos.length)];

            const auto = this._crearAuto(tipo, color);
            const z = zMin + Math.random() * (zMax - zMin);
            auto.position.set(carril.x, 0.05, z);
            if (carril.direccion < 0) auto.rotation.y = Math.PI;

            auto.userData = {
                direccion: carril.direccion,
                velocidadBase: carril.velocidadBase,
                velocidadActual: carril.velocidadBase * (0.8 + Math.random() * 0.4),
                carrilX: carril.x,
                zMin, zMax,
                autoAdelante: null,
                distanciaMin: 7 + Math.random() * 3
            };

            this.scene.add(auto);
            this.autos.push(auto);
        }

       // Carriles dentro de la calle perpendicular (z entre 20 y 40)
        const carrilesCruce = [
            { z: 26, direccion: 1, velocidadBase: 5 },
            { z: 34, direccion: -1, velocidadBase: 5 }
        ];

        const xMin = -170;
        const xMax = 220;

        for (let i = 0; i < 8; i++) {
            const carril = carrilesCruce[i % 2];
            const tipo = tiposAutos[Math.floor(Math.random() * tiposAutos.length)];
            const color = coloresAutos[Math.floor(Math.random() * coloresAutos.length)];

            const auto = this._crearAuto(tipo, color);
            const x = xMin + Math.random() * (xMax - xMin);
            auto.position.set(x, 0.05, carril.z);
            auto.rotation.y = carril.direccion > 0 ? Math.PI / 2 : -Math.PI / 2;

            auto.userData = {
                direccion: carril.direccion,
                velocidadBase: carril.velocidadBase,
                velocidadActual: carril.velocidadBase * (0.8 + Math.random() * 0.4),
                carrilZ: carril.z,
                xMin, xMax,
                esCruce: true
            };

            this.scene.add(auto);
            this.autosCruzando.push(auto);
        }

        carriles.forEach(carril => {
            const autosCarril = this.autos.filter(a => a.userData.carrilX === carril.x);
            autosCarril.sort((a, b) => {
                if (carril.direccion > 0) return a.position.z - b.position.z;
                return b.position.z - a.position.z;
            });
            for (let i = 0; i < autosCarril.length - 1; i++) {
                autosCarril[i].userData.autoAdelante = autosCarril[i + 1];
            }
        });
    }

    // ============================================================
    // NUBES
    // ============================================================
    _crearNubes() {
        const grupo = new THREE.Group();

        for (let i = 0; i < 20; i++) {
            const texturaNube = crearTexturaNube();
            const materialNube = new THREE.SpriteMaterial({
                map: texturaNube, transparent: true, opacity: 0.65, depthWrite: false
            });
            const nube = new THREE.Sprite(materialNube);
            const escala = 50 + Math.random() * 70;
            nube.scale.set(escala, escala * 0.5, 1);

            nube.position.set(
                (Math.random() - 0.5) * 600,
                90 + Math.random() * 80,
                (Math.random() - 0.5) * 600
            );

            nube.userData.velocidad = 0.2 + Math.random() * 0.3;
            grupo.add(nube);
            this.nubes.push(nube);
        }

        this.scene.add(grupo);
    }

    // ============================================================
    // ANIMACIÓN
    // ============================================================
    actualizar(dt) {
        this.tiempo += dt;

        this.autos.forEach(auto => {
            const datos = auto.userData;
            let velocidadObjetivo = datos.velocidadActual;

            if (datos.autoAdelante) {
                const distancia = Math.abs(datos.autoAdelante.position.z - auto.position.z);
                if (distancia < datos.distanciaMin) {
                    velocidadObjetivo = Math.max(0, datos.velocidadBase * (distancia / datos.distanciaMin) * 0.5);
                } else if (distancia < datos.distanciaMin * 1.5) {
                    velocidadObjetivo = datos.velocidadBase * 0.6;
                }
            }

            datos.velocidadActual += (velocidadObjetivo - datos.velocidadActual) * 2 * dt;
            auto.position.z += datos.direccion * datos.velocidadActual * dt;

            if (datos.direccion > 0 && auto.position.z > datos.zMax + 10) {
                auto.position.z = datos.zMin - 10;
            } else if (datos.direccion < 0 && auto.position.z < datos.zMin - 10) {
                auto.position.z = datos.zMax + 10;
            }
        });

        this.autosCruzando.forEach(auto => {
            const datos = auto.userData;
            auto.position.x += datos.direccion * datos.velocidadActual * dt;

            if (datos.direccion > 0 && auto.position.x > datos.xMax + 10) {
                auto.position.x = datos.xMin - 10;
            } else if (datos.direccion < 0 && auto.position.x < datos.xMin - 10) {
                auto.position.x = datos.xMax + 10;
            }
        });

        this.nubes.forEach(nube => {
            nube.position.x += nube.userData.velocidad * dt;
            if (nube.position.x > 350) nube.position.x = -350;
        });
    }
}