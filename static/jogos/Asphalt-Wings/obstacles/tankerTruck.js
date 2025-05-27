import * as THREE from 'three';
import {
    darkGlassMaterial,
    chromeMaterial,
    darkMetalMaterial,
    headlightMaterial,
    taillightMaterial
} from '../config.js';
import { addDetailedWheels } from '../utils.js';

// Caminhão Tanque Detalhado
export function createObstacleTankerTruckDetailed() {
    const group = new THREE.Group();
    group.userData.type = 'truck';
    const cabColor = new THREE.Color(Math.random() * 0xffffff);
    const cabMat = new THREE.MeshStandardMaterial({ color: cabColor, metalness: 0.5, roughness: 0.5 });

    const cabW = 2.0, cabH = 1.9, cabL = 1.8;
    const tankR = 1.1, tankL = 7.0;
    const totalL = cabL + tankL;
    const wheelR = 0.5, wheelT = 0.3;
    const baseY = wheelR + cabH * 0.4;

    // Cabine
    const cabGeo = new THREE.BoxGeometry(cabW, cabH, cabL);
    const cabMesh = new THREE.Mesh(cabGeo, cabMat);
    cabMesh.position.set(0, baseY, tankL / 2);
    cabMesh.castShadow = true; group.add(cabMesh);
    const wsGeo = new THREE.PlaneGeometry(cabW * 0.8, cabH * 0.4);
    const wsMesh = new THREE.Mesh(wsGeo, darkGlassMaterial);
    wsMesh.position.set(0, cabMesh.position.y + cabH*0.15, cabMesh.position.z + cabL/2 + 0.01);
    wsMesh.rotation.x = -Math.PI/15; group.add(wsMesh);
    const mirrorGeo = new THREE.BoxGeometry(0.08, 0.25, 0.2);
    const mirrorL = new THREE.Mesh(mirrorGeo, darkMetalMaterial);
    mirrorL.position.set(-cabW/2 - 0.08, cabMesh.position.y + cabH*0.1, cabMesh.position.z + cabL*0.2); group.add(mirrorL);
    const mirrorR = new THREE.Mesh(mirrorGeo, darkMetalMaterial);
    mirrorR.position.set(cabW/2 + 0.08, cabMesh.position.y + cabH*0.1, cabMesh.position.z + cabL*0.2); group.add(mirrorR);
    const grilleGeo = new THREE.BoxGeometry(cabW*0.7, cabH*0.2, 0.05);
    const grilleMesh = new THREE.Mesh(grilleGeo, darkMetalMaterial);
    grilleMesh.position.set(0, cabMesh.position.y - cabH*0.1, cabMesh.position.z + cabL/2 + 0.03); group.add(grilleMesh);
    const hlGeo = new THREE.BoxGeometry(0.25, 0.15, 0.05);
    const hlL = new THREE.Mesh(hlGeo, headlightMaterial);
    hlL.position.set(-cabW*0.3, cabMesh.position.y + cabH*0.05, cabMesh.position.z + cabL/2 + 0.01); group.add(hlL);
    const hlR = new THREE.Mesh(hlGeo, headlightMaterial);
    hlR.position.set(cabW*0.3, cabMesh.position.y + cabH*0.05, cabMesh.position.z + cabL/2 + 0.01); group.add(hlR);

    // Tanque (Cilindro)
    const tankGeo = new THREE.CylinderGeometry(tankR, tankR, tankL, 32);
    tankGeo.rotateX(Math.PI / 2);
    const tankMesh = new THREE.Mesh(tankGeo, chromeMaterial);
    tankMesh.position.set(0, wheelR + tankR, -cabL / 2); // Posição Y própria
    tankMesh.castShadow = true;
    tankMesh.receiveShadow = true; group.add(tankMesh);
    const capGeo = new THREE.CircleGeometry(tankR, 32);
    const capMat = chromeMaterial.clone(); capMat.side = THREE.DoubleSide;
    const frontCap = new THREE.Mesh(capGeo, capMat);
    frontCap.position.set(0, tankMesh.position.y, tankMesh.position.z + tankL/2);
    frontCap.rotation.y = Math.PI;
    group.add(frontCap);
    const rearCap = new THREE.Mesh(capGeo, capMat);
    rearCap.position.set(0, tankMesh.position.y, tankMesh.position.z - tankL/2);
    group.add(rearCap);
    const supportGeo = new THREE.BoxGeometry(0.3, tankR*1.5, 0.3);
    const supportMat = darkMetalMaterial;
    const support1 = new THREE.Mesh(supportGeo, supportMat);
    support1.position.set(0, wheelR + tankR*0.75, tankMesh.position.z + tankL*0.2);
    group.add(support1);
    const support2 = new THREE.Mesh(supportGeo, supportMat);
    support2.position.set(0, wheelR + tankR*0.75, tankMesh.position.z - tankL*0.2);
    group.add(support2);
    const tlGeo = new THREE.BoxGeometry(0.15, 0.15, 0.05);
    const tlL = new THREE.Mesh(tlGeo, taillightMaterial);
    tlL.position.set(-cabW*0.3, wheelR + tankR*0.5, tankMesh.position.z - tankL/2 - 0.1); group.add(tlL);
    const tlR = new THREE.Mesh(tlGeo, taillightMaterial);
    tlR.position.set(cabW*0.3, wheelR + tankR*0.5, tankMesh.position.z - tankL/2 - 0.1); group.add(tlR);

    addDetailedWheels(group, 3, wheelR, wheelT, cabW, totalL*0.9, 0, darkMetalMaterial);
    return group;
}
