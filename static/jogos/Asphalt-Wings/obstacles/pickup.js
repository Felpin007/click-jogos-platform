import * as THREE from 'three';
import {
    glassMaterial,
    darkMetalMaterial,
    rubberMaterial,
    headlightMaterial,
    taillightMaterial
} from '../config.js';
import { addDetailedWheels } from '../utils.js';

// Pickup Detalhada
export function createObstaclePickupDetailed() {
    const group = new THREE.Group();
    group.userData.type = 'car';
    const cabColor = new THREE.Color(Math.random() * 0xffffff);
    const bedColor = cabColor.clone().multiplyScalar(0.8);
    const cabMat = new THREE.MeshStandardMaterial({ color: cabColor, metalness: 0.5, roughness: 0.5 });
    const bedMat = new THREE.MeshStandardMaterial({ color: bedColor, metalness: 0.4, roughness: 0.6 });

    const cabW = 1.8, cabH = 0.8, cabL = 2.0;
    const bedW = 1.7, bedH = 0.5, bedL = 2.2;
    const totalL = cabL + bedL;
    const wheelR = 0.38, wheelT = 0.22;

    const baseY = wheelR + Math.max(cabH, bedH) * 0.4;

    // Cabine
    const cabGeo = new THREE.BoxGeometry(cabW, cabH, cabL);
    const cabMesh = new THREE.Mesh(cabGeo, cabMat);
    cabMesh.position.set(0, baseY + (cabH - Math.max(cabH, bedH))*0.5, bedL / 2);
    cabMesh.castShadow = true; group.add(cabMesh);
    const wsGeo = new THREE.PlaneGeometry(cabW * 0.8, cabH * 0.5);
    const wsMesh = new THREE.Mesh(wsGeo, glassMaterial);
    wsMesh.position.set(0, cabMesh.position.y + cabH*0.1, cabMesh.position.z + cabL/2 + 0.01);
    wsMesh.rotation.x = -Math.PI/12; group.add(wsMesh);
    const swGeo = new THREE.PlaneGeometry(cabL * 0.6, cabH * 0.4);
    const swMeshL = new THREE.Mesh(swGeo, glassMaterial);
    swMeshL.position.set(-cabW/2 - 0.01, cabMesh.position.y, cabMesh.position.z);
    swMeshL.rotation.y = Math.PI/2; group.add(swMeshL);
    const swMeshR = new THREE.Mesh(swGeo, glassMaterial);
    swMeshR.position.set(cabW/2 + 0.01, cabMesh.position.y, cabMesh.position.z);
    swMeshR.rotation.y = -Math.PI/2; group.add(swMeshR);
    const mirrorGeo = new THREE.BoxGeometry(0.06, 0.12, 0.18);
    const mirrorL = new THREE.Mesh(mirrorGeo, darkMetalMaterial);
    mirrorL.position.set(-cabW/2 - 0.06, cabMesh.position.y + cabH*0.2, cabMesh.position.z + cabL*0.3); group.add(mirrorL);
    const mirrorR = new THREE.Mesh(mirrorGeo, darkMetalMaterial);
    mirrorR.position.set(cabW/2 + 0.06, cabMesh.position.y + cabH*0.2, cabMesh.position.z + cabL*0.3); group.add(mirrorR);

    // Caçamba (Bed)
    const bedGeo = new THREE.BoxGeometry(bedW, bedH, bedL);
    const bedMesh = new THREE.Mesh(bedGeo, bedMat);
    bedMesh.position.set(0, baseY + (bedH - Math.max(cabH, bedH))*0.5, -cabL / 2);
    bedMesh.castShadow = true; group.add(bedMesh);
    const wallH = 0.15, wallT = 0.05;
    const sideWallGeo = new THREE.BoxGeometry(wallT, wallH, bedL*0.95);
    const backWallGeo = new THREE.BoxGeometry(bedW*0.95, wallH, wallT);
    const wallMat = bedMat.clone();
    wallMat.color.multiplyScalar(0.9);
    const wallL = new THREE.Mesh(sideWallGeo, wallMat);
    wallL.position.set(-bedW/2+wallT/2, bedMesh.position.y+bedH/2+wallH/2, bedMesh.position.z);
    group.add(wallL);
    const wallR = new THREE.Mesh(sideWallGeo, wallMat);
    wallR.position.set(bedW/2-wallT/2, bedMesh.position.y+bedH/2+wallH/2, bedMesh.position.z);
    group.add(wallR);
    const wallBack = new THREE.Mesh(backWallGeo, wallMat);
    wallBack.position.set(0, bedMesh.position.y+bedH/2+wallH/2, bedMesh.position.z - bedL/2 + wallT/2);
    group.add(wallBack);
    const tlGeo = new THREE.BoxGeometry(0.15, 0.2, 0.05);
    const tlL = new THREE.Mesh(tlGeo, taillightMaterial);
    tlL.position.set(-bedW*0.4, bedMesh.position.y, bedMesh.position.z - bedL/2 - 0.01); group.add(tlL);
    const tlR = new THREE.Mesh(tlGeo, taillightMaterial);
    tlR.position.set(bedW*0.4, bedMesh.position.y, bedMesh.position.z - bedL/2 - 0.01); group.add(tlR);
    const bumperGeo = new THREE.BoxGeometry(cabW*1.02, cabH*0.15, 0.1);
    const frontBumper = new THREE.Mesh(bumperGeo, rubberMaterial);
    frontBumper.position.set(0, cabMesh.position.y - cabH*0.3, cabMesh.position.z + cabL/2 + 0.05); group.add(frontBumper);
    const hlGeo = new THREE.BoxGeometry(0.2, 0.12, 0.05);
    const hlL = new THREE.Mesh(hlGeo, headlightMaterial);
    hlL.position.set(-cabW*0.35, cabMesh.position.y + cabH*0.05, cabMesh.position.z + cabL/2 + 0.01); group.add(hlL);
    const hlR = new THREE.Mesh(hlGeo, headlightMaterial);
    hlR.position.set(cabW*0.35, cabMesh.position.y + cabH*0.05, cabMesh.position.z + cabL/2 + 0.01); group.add(hlR);


    addDetailedWheels(group, 2, wheelR, wheelT, cabW, totalL*0.8, 0);
    return group;
}
