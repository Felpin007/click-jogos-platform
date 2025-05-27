import * as THREE from 'three';
import {
    glassMaterial,
    darkMetalMaterial,
    rubberMaterial,
    headlightMaterial,
    taillightMaterial
} from '../config.js';
import { addDetailedWheels } from '../utils.js';

// Hatchback Detalhado
export function createObstacleHatchbackDetailed() {
    const group = new THREE.Group();
    group.userData.type = 'car';
    const color = new THREE.Color(Math.random() * 0xffffff);
    const bodyMat = new THREE.MeshStandardMaterial({ color: color, metalness: 0.5, roughness: 0.5 });
    const carW = 1.6, carH = 0.75, carL = 3.5;
    const wheelR = 0.28, wheelT = 0.16;

    // Base
    const baseGeo = new THREE.BoxGeometry(carW, carH * 0.8, carL);
    const baseMesh = new THREE.Mesh(baseGeo, bodyMat);
    baseMesh.position.y = wheelR + carH * 0.4;
    baseMesh.castShadow = true; group.add(baseMesh);

    // Cabine/Corpo superior (mais longo, inclinado atrás)
    const cabinW = carW * 0.9, cabinH = 0.7, cabinL = carL * 0.7;
    const cabinGeo = new THREE.BoxGeometry(cabinW, cabinH, cabinL);
    const cabinMesh = new THREE.Mesh(cabinGeo, bodyMat);
    cabinMesh.position.y = baseMesh.position.y + carH * 0.5;
    cabinMesh.position.z = carL * 0.0;
    cabinMesh.castShadow = true; group.add(cabinMesh);

    // Vidro Traseiro Inclinado (Hatch)
    const hatchGeo = new THREE.PlaneGeometry(cabinW * 0.85, cabinH * 1.1);
    const hatchMesh = new THREE.Mesh(hatchGeo, glassMaterial);
    hatchMesh.position.set(0, cabinMesh.position.y-cabinH*0.05, cabinMesh.position.z - cabinL/2 + 0.2);
    hatchMesh.rotation.x = Math.PI / 4;
    group.add(hatchMesh);
    const swGeo = new THREE.PlaneGeometry(cabinL * 0.7, cabinH * 0.6);
    const swMeshL = new THREE.Mesh(swGeo, glassMaterial);
    swMeshL.position.set(-cabinW/2 - 0.01, cabinMesh.position.y, cabinMesh.position.z);
    swMeshL.rotation.y = Math.PI/2; group.add(swMeshL);
    const swMeshR = new THREE.Mesh(swGeo, glassMaterial);
    swMeshR.position.set(cabinW/2 + 0.01, cabinMesh.position.y, cabinMesh.position.z);
    swMeshR.rotation.y = -Math.PI/2; group.add(swMeshR);
    const grilleGeo = new THREE.BoxGeometry(carW*0.6, carH*0.2, 0.05);
    const grilleMesh = new THREE.Mesh(grilleGeo, darkMetalMaterial);
    grilleMesh.position.set(0, baseMesh.position.y, baseMesh.position.z + carL/2 + 0.03); group.add(grilleMesh);
    const hlGeo = new THREE.BoxGeometry(0.18, 0.1, 0.05);
    const hlL = new THREE.Mesh(hlGeo, headlightMaterial);
    hlL.position.set(-carW*0.35, baseMesh.position.y + carH*0.1, baseMesh.position.z + carL/2 + 0.01); group.add(hlL);
    const hlR = new THREE.Mesh(hlGeo, headlightMaterial);
    hlR.position.set(carW*0.35, baseMesh.position.y + carH*0.1, baseMesh.position.z + carL/2 + 0.01); group.add(hlR);
    const tlGeo = new THREE.BoxGeometry(0.15, 0.25, 0.05);
    const tlL = new THREE.Mesh(tlGeo, taillightMaterial);
    tlL.position.set(-carW*0.4, baseMesh.position.y + carH*0.15, baseMesh.position.z - carL/2 - 0.01); group.add(tlL);
    const tlR = new THREE.Mesh(tlGeo, taillightMaterial);
    tlR.position.set(carW*0.4, baseMesh.position.y + carH*0.15, baseMesh.position.z - carL/2 - 0.01); group.add(tlR);
    const bumperGeo = new THREE.BoxGeometry(carW*1.02, carH*0.15, 0.1);
    const frontBumper = new THREE.Mesh(bumperGeo, rubberMaterial);
    frontBumper.position.set(0, baseMesh.position.y - carH*0.3, baseMesh.position.z + carL/2 + 0.05); group.add(frontBumper);
    const rearBumper = new THREE.Mesh(bumperGeo, rubberMaterial);
    rearBumper.position.set(0, baseMesh.position.y - carH*0.3, baseMesh.position.z - carL/2 - 0.05); group.add(rearBumper);
    const mirrorGeo = new THREE.BoxGeometry(0.05, 0.1, 0.15);
    const mirrorL = new THREE.Mesh(mirrorGeo, darkMetalMaterial);
    mirrorL.position.set(-carW/2 - 0.05, cabinMesh.position.y + cabinH*0.2, cabinMesh.position.z + cabinL*0.3); group.add(mirrorL);
    const mirrorR = new THREE.Mesh(mirrorGeo, darkMetalMaterial);
    mirrorR.position.set(carW/2 + 0.05, cabinMesh.position.y + cabinH*0.2, cabinMesh.position.z + cabinL*0.3); group.add(mirrorR);

    addDetailedWheels(group, 2, wheelR, wheelT, carW, carL, 0);
    return group;
}
