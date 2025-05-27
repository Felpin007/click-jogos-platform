import * as THREE from 'three';
import {
    darkGlassMaterial,
    darkMetalMaterial,
    rubberMaterial,
    headlightMaterial,
    taillightMaterial
} from '../config.js';
import { addDetailedWheels } from '../utils.js';

// Van Detalhada
export function createObstacleVanDetailed() {
    const group = new THREE.Group();
    group.userData.type = 'van';
    const color = 0xc5c5c5;
    const bodyMat = new THREE.MeshStandardMaterial({ color: color, metalness: 0.4, roughness: 0.6 });
    const vanW = 1.9, vanH = 1.6, vanL = 4.8;
    const wheelR = 0.35, wheelT = 0.2;

    // Corpo principal (caixa única)
    const bodyGeo = new THREE.BoxGeometry(vanW, vanH, vanL);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = wheelR + vanH * 0.5;
    bodyMesh.castShadow = true; group.add(bodyMesh);

    // Frente distinta (capô curto)
    const hoodGeo = new THREE.BoxGeometry(vanW*0.9, vanH*0.5, vanL*0.15);
    const hoodMesh = new THREE.Mesh(hoodGeo, bodyMat);
    hoodMesh.position.set(0, bodyMesh.position.y - vanH*0.25, bodyMesh.position.z + vanL*0.425);
    hoodMesh.rotation.x = -Math.PI/20;
    hoodMesh.castShadow = true; group.add(hoodMesh);

    // Vidros (Frontal grande, laterais pequenas, traseiro opcional)
    const wsGeo = new THREE.PlaneGeometry(vanW * 0.8, vanH * 0.4);
    const wsMesh = new THREE.Mesh(wsGeo, darkGlassMaterial);
    wsMesh.position.set(0, bodyMesh.position.y + vanH*0.2, bodyMesh.position.z + vanL*0.35 + 0.01);
    wsMesh.rotation.x = -Math.PI/6;
    group.add(wsMesh);
    const swGeo = new THREE.PlaneGeometry(vanL * 0.15, vanH * 0.3);
    const swMeshL = new THREE.Mesh(swGeo, darkGlassMaterial);
    swMeshL.position.set(-vanW/2 - 0.01, bodyMesh.position.y + vanH*0.1, bodyMesh.position.z + vanL*0.25);
    swMeshL.rotation.y = Math.PI/2; group.add(swMeshL);
    const swMeshR = new THREE.Mesh(swGeo, darkGlassMaterial);
    swMeshR.position.set(vanW/2 + 0.01, bodyMesh.position.y + vanH*0.1, bodyMesh.position.z + vanL*0.25);
    swMeshR.rotation.y = -Math.PI/2; group.add(swMeshR);

    // Detalhes (Grade, luzes, para-choques, espelhos)
    const grilleGeo = new THREE.BoxGeometry(vanW*0.7, vanH*0.15, 0.05);
    const grilleMesh = new THREE.Mesh(grilleGeo, darkMetalMaterial);
    grilleMesh.position.set(0, hoodMesh.position.y, hoodMesh.position.z + vanL*0.075 + 0.03); group.add(grilleMesh);
    const hlGeo = new THREE.BoxGeometry(0.2, 0.12, 0.05);
    const hlL = new THREE.Mesh(hlGeo, headlightMaterial);
    hlL.position.set(-vanW*0.35, hoodMesh.position.y + vanH*0.1, hoodMesh.position.z + vanL*0.075 + 0.01); group.add(hlL);
    const hlR = new THREE.Mesh(hlGeo, headlightMaterial);
    hlR.position.set(vanW*0.35, hoodMesh.position.y + vanH*0.1, hoodMesh.position.z + vanL*0.075 + 0.01); group.add(hlR);
    const tlGeo = new THREE.BoxGeometry(0.15, 0.4, 0.05);
    const tlL = new THREE.Mesh(tlGeo, taillightMaterial);
    tlL.position.set(-vanW*0.45, bodyMesh.position.y, bodyMesh.position.z - vanL/2 - 0.01); group.add(tlL);
    const tlR = new THREE.Mesh(tlGeo, taillightMaterial);
    tlR.position.set(vanW*0.45, bodyMesh.position.y, bodyMesh.position.z - vanL/2 - 0.01); group.add(tlR);
    const bumperGeo = new THREE.BoxGeometry(vanW*1.02, vanH*0.15, 0.1);
    const frontBumper = new THREE.Mesh(bumperGeo, rubberMaterial);
    frontBumper.position.set(0, bodyMesh.position.y - vanH*0.4, bodyMesh.position.z + vanL/2 + 0.05); group.add(frontBumper);
    const rearBumper = new THREE.Mesh(bumperGeo, rubberMaterial);
    rearBumper.position.set(0, bodyMesh.position.y - vanH*0.4, bodyMesh.position.z - vanL/2 - 0.05); group.add(rearBumper);
    const mirrorGeo = new THREE.BoxGeometry(0.06, 0.15, 0.18);
    const mirrorL = new THREE.Mesh(mirrorGeo, darkMetalMaterial);
    mirrorL.position.set(-vanW/2 - 0.06, bodyMesh.position.y + vanH*0.25, bodyMesh.position.z + vanL*0.3); group.add(mirrorL);
    const mirrorR = new THREE.Mesh(mirrorGeo, darkMetalMaterial);
    mirrorR.position.set(vanW/2 + 0.06, bodyMesh.position.y + vanH*0.25, bodyMesh.position.z + vanL*0.3); group.add(mirrorR);


    addDetailedWheels(group, 2, wheelR, wheelT, vanW, vanL, 0, darkMetalMaterial);
    return group;
}
