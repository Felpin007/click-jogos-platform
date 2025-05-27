import * as THREE from 'three';
import {
    darkGlassMaterial,
    darkMetalMaterial,
    headlightMaterial,
    taillightMaterial
} from '../config.js';
import { addDetailedWheels } from '../utils.js';

// Caminhão Baú Detalhado
export function createObstacleBoxTruckDetailed() {
    const group = new THREE.Group();
    group.userData.type = 'truck';
    const cabColor = new THREE.Color(Math.random() * 0xffffff);
    const boxColor = 0xddeeff; // Branco azulado
    const cabMat = new THREE.MeshStandardMaterial({ color: cabColor, metalness: 0.5, roughness: 0.5 });
    const boxMat = new THREE.MeshStandardMaterial({ color: boxColor, metalness: 0.3, roughness: 0.7 });

    const cabW = 2.0, cabH = 1.9, cabL = 1.8;
    const boxW = 2.2, boxH = 2.5, boxL = 6.5;
    const totalL = cabL + boxL;
    const wheelR = 0.5, wheelT = 0.3;
    const baseY = wheelR + cabH * 0.4; // Baseado na cabine

    // Cabine
    const cabGeo = new THREE.BoxGeometry(cabW, cabH, cabL);
    const cabMesh = new THREE.Mesh(cabGeo, cabMat);
    cabMesh.position.set(0, baseY, boxL / 2);
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

    // Baú (Box)
    const boxGeo = new THREE.BoxGeometry(boxW, boxH, boxL);
    const boxMesh = new THREE.Mesh(boxGeo, boxMat);
    boxMesh.position.set(0, wheelR + boxH * 0.5, -cabL / 2); // Posição Y própria
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true; group.add(boxMesh);
    // Detalhes do baú (linhas/rebites simulados)
    const rivetMat = darkMetalMaterial.clone(); rivetMat.roughness = 0.8;
    for (let i=0; i<5; i++) { // Linhas verticais
        const rivetGeo = new THREE.BoxGeometry(0.03, boxH*0.9, 0.03);
        const rivetL = new THREE.Mesh(rivetGeo, rivetMat);
        rivetL.position.set(-boxW/2, boxMesh.position.y, boxMesh.position.z + boxL*0.4 - i*boxL*0.2);
        group.add(rivetL);
        const rivetR = new THREE.Mesh(rivetGeo, rivetMat);
        rivetR.position.set(boxW/2, boxMesh.position.y, boxMesh.position.z + boxL*0.4 - i*boxL*0.2);
        group.add(rivetR);
    }
     // Porta traseira (Roll-up door simulada)
    const doorGeo = new THREE.PlaneGeometry(boxW*0.9, boxH*0.9);
    const doorMesh = new THREE.Mesh(doorGeo, darkMetalMaterial);
    doorMesh.position.set(0, boxMesh.position.y, boxMesh.position.z - boxL/2 - 0.01);
    group.add(doorMesh);
    // Adiciona lanternas traseiras ao baú
    const tlGeo = new THREE.BoxGeometry(0.15, 0.3, 0.05);
    const tlL = new THREE.Mesh(tlGeo, taillightMaterial);
    tlL.position.set(-boxW*0.4, boxMesh.position.y - boxH*0.3, boxMesh.position.z - boxL/2 - 0.01); group.add(tlL);
    const tlR = new THREE.Mesh(tlGeo, taillightMaterial);
    tlR.position.set(boxW*0.4, boxMesh.position.y - boxH*0.3, boxMesh.position.z - boxL/2 - 0.01); group.add(tlR);


    addDetailedWheels(group, 3, wheelR, wheelT, cabW, totalL*0.9, 0, darkMetalMaterial); // 3 eixos
    return group;
}
