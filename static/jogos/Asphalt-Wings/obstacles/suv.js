import * as THREE from 'three';
import {
    darkGlassMaterial,
    darkMetalMaterial,
    rubberMaterial,
    headlightMaterial,
    taillightMaterial
} from '../config.js';
import { addDetailedWheels } from '../utils.js';

// SUV Detalhado
export function createObstacleSUVDetailed() {
    const group = new THREE.Group();
    group.userData.type = 'car';
    const color = new THREE.Color(Math.random() * 0xffffff);
    const bodyMat = new THREE.MeshStandardMaterial({ color: color, metalness: 0.4, roughness: 0.6 });
    const carW = 1.9, carH = 0.9, carL = 4.3;
    const wheelR = 0.4, wheelT = 0.25;

    // Base alta
    const baseGeo = new THREE.BoxGeometry(carW, carH, carL);
    const baseMesh = new THREE.Mesh(baseGeo, bodyMat);
    baseMesh.position.y = wheelR + carH * 0.5;
    baseMesh.castShadow = true; group.add(baseMesh);

    // Cabine alta e longa
    const cabinW = carW * 0.9, cabinH = 0.8, cabinL = carL * 0.75;
    const cabinGeo = new THREE.BoxGeometry(cabinW, cabinH, cabinL);
    const cabinMesh = new THREE.Mesh(cabinGeo, bodyMat);
    cabinMesh.position.y = baseMesh.position.y + carH * 0.4;
    cabinMesh.position.z = -carL * 0.05;
    cabinMesh.castShadow = true; group.add(cabinMesh);

    // Detalhes SUV
    const railGeo = new THREE.BoxGeometry(0.08, 0.08, cabinL * 0.9);
    const railMat = darkMetalMaterial;
    const railL = new THREE.Mesh(railGeo, railMat);
    railL.position.set(-cabinW/2 * 0.8, cabinMesh.position.y + cabinH/2 + 0.04, cabinMesh.position.z);
    group.add(railL);
    const railR = new THREE.Mesh(railGeo, railMat);
    railR.position.set(cabinW/2 * 0.8, cabinMesh.position.y + cabinH/2 + 0.04, cabinMesh.position.z);
    group.add(railR);
    const bumperGeo = new THREE.BoxGeometry(carW * 1.02, carH * 0.25, 0.15);
    const frontBumper = new THREE.Mesh(bumperGeo, rubberMaterial);
    frontBumper.position.set(0, baseMesh.position.y - carH*0.35, baseMesh.position.z + carL/2 + 0.07);
    group.add(frontBumper);
    const rearBumper = new THREE.Mesh(bumperGeo, rubberMaterial);
    rearBumper.position.set(0, baseMesh.position.y - carH*0.35, baseMesh.position.z - carL/2 - 0.07);
    group.add(rearBumper);
    const wsGeo = new THREE.PlaneGeometry(cabinW * 0.85, cabinH * 0.7);
    const wsMesh = new THREE.Mesh(wsGeo, darkGlassMaterial);
    wsMesh.position.set(0, cabinMesh.position.y + cabinH*0.1, cabinMesh.position.z + cabinL/2 + 0.01);
    wsMesh.rotation.x = -Math.PI/10; group.add(wsMesh);
    const swGeo = new THREE.PlaneGeometry(cabinL * 0.3, cabinH * 0.6);
    const swMeshL1 = new THREE.Mesh(swGeo, darkGlassMaterial);
    swMeshL1.position.set(-cabinW/2 - 0.01, cabinMesh.position.y, cabinMesh.position.z + cabinL*0.15);
    swMeshL1.rotation.y = Math.PI/2; group.add(swMeshL1);
    const swMeshR1 = new THREE.Mesh(swGeo, darkGlassMaterial);
    swMeshR1.position.set(cabinW/2 + 0.01, cabinMesh.position.y, cabinMesh.position.z + cabinL*0.15);
    swMeshR1.rotation.y = -Math.PI/2; group.add(swMeshR1);
    const swMeshL2 = new THREE.Mesh(swGeo, darkGlassMaterial);
    swMeshL2.position.set(-cabinW/2 - 0.01, cabinMesh.position.y, cabinMesh.position.z - cabinL*0.25);
    swMeshL2.rotation.y = Math.PI/2; group.add(swMeshL2);
    const swMeshR2 = new THREE.Mesh(swGeo, darkGlassMaterial);
    swMeshR2.position.set(cabinW/2 + 0.01, cabinMesh.position.y, cabinMesh.position.z - cabinL*0.25);
    swMeshR2.rotation.y = -Math.PI/2; group.add(swMeshR2);
    const hlGeo = new THREE.BoxGeometry(0.25, 0.15, 0.05);
    const hlL = new THREE.Mesh(hlGeo, headlightMaterial);
    hlL.position.set(-carW*0.3, baseMesh.position.y + carH*0.1, baseMesh.position.z + carL/2 + 0.01); group.add(hlL);
    const hlR = new THREE.Mesh(hlGeo, headlightMaterial);
    hlR.position.set(carW*0.3, baseMesh.position.y + carH*0.1, baseMesh.position.z + carL/2 + 0.01); group.add(hlR);
    const tlGeo = new THREE.BoxGeometry(0.2, 0.3, 0.05);
    const tlL = new THREE.Mesh(tlGeo, taillightMaterial);
    tlL.position.set(-carW*0.4, baseMesh.position.y + carH*0.1, baseMesh.position.z - carL/2 - 0.01); group.add(tlL);
    const tlR = new THREE.Mesh(tlGeo, taillightMaterial);
    tlR.position.set(carW*0.4, baseMesh.position.y + carH*0.1, baseMesh.position.z - carL/2 - 0.01); group.add(tlR);
    const mirrorGeo = new THREE.BoxGeometry(0.06, 0.12, 0.18);
    const mirrorL = new THREE.Mesh(mirrorGeo, darkMetalMaterial);
    mirrorL.position.set(-carW/2 - 0.06, cabinMesh.position.y + cabinH*0.25, cabinMesh.position.z + cabinL*0.35); group.add(mirrorL);
    const mirrorR = new THREE.Mesh(mirrorGeo, darkMetalMaterial);
    mirrorR.position.set(carW/2 + 0.06, cabinMesh.position.y + cabinH*0.25, cabinMesh.position.z + cabinL*0.35); group.add(mirrorR);

    addDetailedWheels(group, 2, wheelR, wheelT, carW, carL, 0, darkMetalMaterial);
    return group;
}
