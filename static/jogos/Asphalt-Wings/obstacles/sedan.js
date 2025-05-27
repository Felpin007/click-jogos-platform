import * as THREE from 'three';
import {
    glassMaterial,
    darkMetalMaterial,
    rubberMaterial,
    headlightMaterial,
    taillightMaterial
} from '../config.js';
import { addDetailedWheels } from '../utils.js';

// Sedan Detalhado
export function createObstacleSedanDetailed() {
    const group = new THREE.Group();
    group.userData.type = 'car';
    const color = new THREE.Color(Math.random() * 0xffffff);
    const bodyMat = new THREE.MeshStandardMaterial({ color: color, metalness: 0.6, roughness: 0.4 });
    const carW = 1.7, carH = 0.7, carL = 4.0;
    const wheelR = 0.3, wheelT = 0.18;

    // Base
    const baseGeo = new THREE.BoxGeometry(carW, carH * 0.8, carL);
    const baseMesh = new THREE.Mesh(baseGeo, bodyMat);
    baseMesh.position.y = wheelR + carH * 0.4;
    baseMesh.castShadow = true; group.add(baseMesh);

    // Cabine
    const cabinW = carW * 0.9, cabinH = 0.6, cabinL = carL * 0.5;
    const cabinGeo = new THREE.BoxGeometry(cabinW, cabinH, cabinL);
    const cabinMesh = new THREE.Mesh(cabinGeo, bodyMat);
    cabinMesh.position.y = baseMesh.position.y + carH * 0.5;
    cabinMesh.position.z = -carL * 0.1;
    cabinMesh.castShadow = true; group.add(cabinMesh);

    // Vidros
    const wsGeo = new THREE.PlaneGeometry(cabinW * 0.9, cabinH * 0.8);
    const wsMesh = new THREE.Mesh(wsGeo, glassMaterial);
    wsMesh.position.set(0, cabinMesh.position.y + cabinH*0.05, cabinMesh.position.z + cabinL/2 + 0.01);
    wsMesh.rotation.x = -Math.PI/9; group.add(wsMesh);
    const swGeo = new THREE.PlaneGeometry(cabinL * 0.8, cabinH * 0.6);
    const swMeshL = new THREE.Mesh(swGeo, glassMaterial);
    swMeshL.position.set(-cabinW/2 - 0.01, cabinMesh.position.y, cabinMesh.position.z);
    swMeshL.rotation.y = Math.PI/2; group.add(swMeshL);
    const swMeshR = new THREE.Mesh(swGeo, glassMaterial);
    swMeshR.position.set(cabinW/2 + 0.01, cabinMesh.position.y, cabinMesh.position.z);
    swMeshR.rotation.y = -Math.PI/2; group.add(swMeshR);

    // Detalhes (grade, luzes, para-choques, espelhos)
    const grilleGeo = new THREE.BoxGeometry(carW*0.5, carH*0.25, 0.05);
    const grilleMesh = new THREE.Mesh(grilleGeo, darkMetalMaterial);
    grilleMesh.position.set(0, baseMesh.position.y, baseMesh.position.z + carL/2 + 0.03);
    group.add(grilleMesh);
    const hlGeo = new THREE.BoxGeometry(0.2, 0.1, 0.05);
    const hlL = new THREE.Mesh(hlGeo, headlightMaterial);
    hlL.position.set(-carW*0.3, baseMesh.position.y + carH*0.1, baseMesh.position.z + carL/2 + 0.01); group.add(hlL);
    const hlR = new THREE.Mesh(hlGeo, headlightMaterial);
    hlR.position.set(carW*0.3, baseMesh.position.y + carH*0.1, baseMesh.position.z + carL/2 + 0.01); group.add(hlR);
    const tlGeo = new THREE.BoxGeometry(0.3, 0.12, 0.05);
    const tlL = new THREE.Mesh(tlGeo, taillightMaterial);
    tlL.position.set(-carW*0.35, baseMesh.position.y + carH*0.05, baseMesh.position.z - carL/2 - 0.01); group.add(tlL);
    const tlR = new THREE.Mesh(tlGeo, taillightMaterial);
    tlR.position.set(carW*0.35, baseMesh.position.y + carH*0.05, baseMesh.position.z - carL/2 - 0.01); group.add(tlR);
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
