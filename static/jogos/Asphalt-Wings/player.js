import * as THREE from 'three';
import {
    glassMaterial,
    chromeMaterial,
    darkMetalMaterial,
    rubberMaterial,
    headlightMaterial,
    taillightMaterial,
    wheelMaterial
} from './config.js';
import { addDetailedWheels } from './utils.js';

/**
 * Cria o modelo 3D detalhado para o carro do jogador.
 * @returns {{carGroup: THREE.Group, collider: THREE.Box3}} Um objeto contendo o Grupo do carro e seu collider Box3.
 */
export function createPlayerCar() {
    const carGroup = new THREE.Group();
    const bodyColor = 0x005cbf;
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.4, roughness: 0.5 });
    const carW = 1.8, carH = 0.6, carL = 3.8;
    const wheelR = 0.35, wheelT = 0.2;

    // Base e Chassi
    const baseGeo = new THREE.BoxGeometry(carW, carH * 0.8, carL);
    const baseMesh = new THREE.Mesh(baseGeo, bodyMaterial);
    baseMesh.position.y = wheelR + carH * 0.4;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    carGroup.add(baseMesh);

    // Corpo Superior
    const upperBodyGeo = new THREE.BoxGeometry(carW * 0.95, carH * 0.7, carL * 0.8);
    const upperBodyMesh = new THREE.Mesh(upperBodyGeo, bodyMaterial);
    upperBodyMesh.position.y = baseMesh.position.y + carH * 0.55;
    upperBodyMesh.position.z = carL * 0.05;
    upperBodyMesh.castShadow = true;
    upperBodyMesh.receiveShadow = true;
    carGroup.add(upperBodyMesh);

    // Capô
    const hoodGeo = new THREE.BoxGeometry(carW * 0.9, carH * 0.2, carL * 0.3);
    const hoodMesh = new THREE.Mesh(hoodGeo, bodyMaterial);
    hoodMesh.position.y = baseMesh.position.y + carH * 0.1;
    hoodMesh.position.z = baseMesh.position.z + carL * 0.35;
    hoodMesh.rotation.x = -Math.PI / 30;
    hoodMesh.castShadow = true;
    hoodMesh.receiveShadow = true;
    carGroup.add(hoodMesh);

     // Porta-malas
    const trunkGeo = new THREE.BoxGeometry(carW * 0.9, carH * 0.2, carL * 0.25);
    const trunkMesh = new THREE.Mesh(trunkGeo, bodyMaterial);
    trunkMesh.position.y = baseMesh.position.y + carH * 0.1;
    trunkMesh.position.z = baseMesh.position.z - carL * 0.375;
    trunkMesh.rotation.x = Math.PI / 40;
    trunkMesh.castShadow = true;
    trunkMesh.receiveShadow = true;
    carGroup.add(trunkMesh);

    // Cabine
    const cabinW = carW * 0.85, cabinH = 0.7, cabinL = carL * 0.5;
    const cabinGeo = new THREE.BoxGeometry(cabinW, cabinH, cabinL);
    const cabinMesh = new THREE.Mesh(cabinGeo, bodyMaterial);
    cabinMesh.position.y = upperBodyMesh.position.y + carH * 0.3;
    cabinMesh.position.z = upperBodyMesh.position.z - carL * 0.1;
    cabinMesh.castShadow = true;
    cabinMesh.receiveShadow = true;
    carGroup.add(cabinMesh);

    // Vidros
    const glassOffset = 0.01;
    const wsGeo = new THREE.PlaneGeometry(cabinW * 0.9, cabinH * 0.8);
    const wsMesh = new THREE.Mesh(wsGeo, glassMaterial);
    wsMesh.position.set(cabinMesh.position.x, cabinMesh.position.y + cabinH * 0.05, cabinMesh.position.z + cabinL / 2 + glassOffset);
    wsMesh.rotation.x = -Math.PI / 8;
    carGroup.add(wsMesh);
    const rwGeo = new THREE.PlaneGeometry(cabinW * 0.85, cabinH * 0.7);
    const rwMesh = new THREE.Mesh(rwGeo, glassMaterial);
    rwMesh.position.set(cabinMesh.position.x, cabinMesh.position.y + cabinH * 0.02, cabinMesh.position.z - cabinL / 2 - glassOffset);
    rwMesh.rotation.x = Math.PI / 7;
    carGroup.add(rwMesh);
    const swH = cabinH * 0.7, swL = cabinL * 0.9;
    const swGeo = new THREE.PlaneGeometry(swL, swH);
    const lwMesh = new THREE.Mesh(swGeo, glassMaterial);
    lwMesh.position.set(cabinMesh.position.x - cabinW / 2 - glassOffset, cabinMesh.position.y, cabinMesh.position.z);
    lwMesh.rotation.y = Math.PI / 2;
    carGroup.add(lwMesh);
    const rwMeshSide = new THREE.Mesh(swGeo, glassMaterial);
    rwMeshSide.position.set(cabinMesh.position.x + cabinW / 2 + glassOffset, cabinMesh.position.y, cabinMesh.position.z);
    rwMeshSide.rotation.y = -Math.PI / 2;
    carGroup.add(rwMeshSide);
    const pillarGeo = new THREE.BoxGeometry(0.05, cabinH, 0.05);
    const pillarMat = new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.7, roughness: 0.3 });
    const pillarFL = new THREE.Mesh(pillarGeo, pillarMat);
    pillarFL.position.set(cabinMesh.position.x - cabinW/2, cabinMesh.position.y, cabinMesh.position.z + cabinL/2);
    carGroup.add(pillarFL);

    // Rodas
    const wheelX = carW / 2 - wheelT * 0.3;
    const wheelZ = carL / 2 * 0.75;
    addDetailedWheels(carGroup, 2, wheelR, wheelT, carW, carL, 0, chromeMaterial);

    // Detalhes: Luzes, Grade, Para-choques
    const grilleH = carH * 0.3, grilleW = carW * 0.6, grilleT = 0.05;
    const grilleGeo = new THREE.BoxGeometry(grilleW, grilleH, grilleT);
    const grilleMesh = new THREE.Mesh(grilleGeo, darkMetalMaterial);
    grilleMesh.position.set(0, baseMesh.position.y, baseMesh.position.z + carL / 2 + grilleT/2);
    carGroup.add(grilleMesh);
    // Faróis
    const headlightSize = 0.15;
    const headlightGeo = new THREE.BoxGeometry(headlightSize*1.5, headlightSize*0.8, 0.05);
    const headlightY = baseMesh.position.y + carH*0.1;
    const headlightX = grilleW / 2 + headlightSize*0.8;
    const headlightZ = baseMesh.position.z + carL / 2 + 0.03;
    const hlL = new THREE.Mesh(headlightGeo, headlightMaterial);
    hlL.name = "headlightL";
    hlL.position.set(-headlightX, headlightY, headlightZ);
    carGroup.add(hlL);
    const hlR = new THREE.Mesh(headlightGeo, headlightMaterial);
    hlR.name = "headlightR";
    hlR.position.set(headlightX, headlightY, headlightZ);
    carGroup.add(hlR);

    // Spotlights (Faróis Reais)
    const spotLightIntensity = 5;
    const spotLightDistance = 40;
    const spotLightAngle = Math.PI / 9;
    const spotLightPenumbra = 0.3;
    const spotLightDecay = 1.8;

    const spotLightL = new THREE.SpotLight(0xffffff, spotLightIntensity, spotLightDistance, spotLightAngle, spotLightPenumbra, spotLightDecay);
    spotLightL.name = "spotlightL";
    spotLightL.castShadow = true;
    spotLightL.shadow.mapSize.width = 1024;
    spotLightL.shadow.mapSize.height = 1024;
    spotLightL.shadow.camera.near = 1;
    spotLightL.shadow.camera.far = spotLightDistance;
    spotLightL.shadow.focus = 1;

    spotLightL.position.set(-headlightX, headlightY + 0.1, headlightZ + 0.2);
    carGroup.add(spotLightL);

    const targetL = new THREE.Object3D();
    targetL.position.set(-headlightX * 0.8, headlightY - 0.5, headlightZ + 15);
    carGroup.add(targetL);
    spotLightL.target = targetL;

    const spotLightR = spotLightL.clone();
    spotLightR.name = "spotlightR";
    spotLightR.position.set(headlightX, headlightY + 0.1, headlightZ + 0.2);
    carGroup.add(spotLightR);

    const targetR = new THREE.Object3D();
    targetR.position.set(headlightX * 0.8, headlightY - 0.5, headlightZ + 15);
    carGroup.add(targetR);
    spotLightR.target = targetR;

    spotLightL.visible = false;
    spotLightR.visible = false;

    // Lanternas Traseiras
    const taillightH = 0.15, taillightW = 0.4, taillightT = 0.05;
    const taillightGeo = new THREE.BoxGeometry(taillightW, taillightH, taillightT);
    const taillightY = baseMesh.position.y + carH*0.05;
    const taillightX = carW / 2 * 0.7;
    const taillightZ = baseMesh.position.z - carL / 2 - 0.03;
    const tlL = new THREE.Mesh(taillightGeo, taillightMaterial);
    tlL.name = "taillightL";
    tlL.position.set(-taillightX, taillightY, taillightZ);
    carGroup.add(tlL);
    const tlR = new THREE.Mesh(taillightGeo, taillightMaterial);
    tlR.name = "taillightR";
    tlR.position.set(taillightX, taillightY, taillightZ);
    carGroup.add(tlR);
    // Para-choques
    const bumperH = carH * 0.2, bumperT = 0.1;
    const bumperGeo = new THREE.BoxGeometry(carW * 1.05, bumperH, bumperT);
    const frontBumper = new THREE.Mesh(bumperGeo, rubberMaterial);
    frontBumper.position.set(0, baseMesh.position.y - carH*0.3, baseMesh.position.z + carL / 2 + bumperT/2);
    carGroup.add(frontBumper);
    const rearBumper = new THREE.Mesh(bumperGeo, rubberMaterial);
    rearBumper.position.set(0, baseMesh.position.y - carH*0.3, baseMesh.position.z - carL / 2 - bumperT/2);
    carGroup.add(rearBumper);

    // Asas de Avião
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide });
    const wingLength = 3.5;
    const wingWidth = 1.0;
    const wingThickness = 0.1;

    const wingGeometry = new THREE.BoxGeometry(1, wingThickness, wingWidth);

    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.name = "leftWing";
    leftWing.geometry.translate(0.5, 0, 0);
    leftWing.position.set(-carW / 2, baseMesh.position.y + carH * 0.1, baseMesh.position.z);
    leftWing.scale.set(0.01 * wingLength, 1, 1);
    leftWing.rotation.y = 0;
    leftWing.castShadow = true;
    carGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.name = "rightWing";
    rightWing.geometry.translate(-0.5, 0, 0);
    rightWing.position.set(carW / 2, baseMesh.position.y + carH * 0.1, baseMesh.position.z);
    rightWing.scale.set(0.01 * wingLength, 1, 1);
    rightWing.rotation.y = 0;
    rightWing.castShadow = true;
    carGroup.add(rightWing);

    // Criar collider
    const collider = new THREE.Box3();
    collider.setFromObject(carGroup, true);

    return { carGroup, collider };
}
