import * as THREE from 'three';
import {
    darkMetalMaterial,
    tankBodyMaterial,
    tankTrackMaterial
} from '../config.js';

// Tanque de Guerra (War Tank) - Detalhado com Primitivas
export function createWarTank() {
    const group = new THREE.Group();
    group.userData.type = 'truck';
    const tankW = 2.4, tankH = 0.8, tankL = 5.0;
    const trackH = 0.6, trackW = 0.5, trackOffsetY = 0.1;

    // Casco (Hull)
    const hullGeo = new THREE.BoxGeometry(tankW, tankH, tankL);
    const hullMesh = new THREE.Mesh(hullGeo, tankBodyMaterial);
    hullMesh.position.y = trackH + tankH / 2 - trackOffsetY;
    hullMesh.castShadow = true;
    hullMesh.receiveShadow = true;
    group.add(hullMesh);
    const glacisGeo = new THREE.BoxGeometry(tankW * 0.9, tankH * 1.2, 0.1);
    const glacisMesh = new THREE.Mesh(glacisGeo, tankBodyMaterial);
    glacisMesh.position.set(0, hullMesh.position.y + tankH*0.1, hullMesh.position.z + tankL/2);
    glacisMesh.rotation.x = -Math.PI / 4;
    glacisMesh.castShadow = true;
    group.add(glacisMesh);

    // Esteiras (Tracks)
    const trackGroupL = new THREE.Group();
    const trackGroupR = new THREE.Group();
    const trackBaseGeo = new THREE.BoxGeometry(trackW, trackH, tankL * 1.05);
    const trackBaseMat = tankTrackMaterial;
    const trackBaseL = new THREE.Mesh(trackBaseGeo, trackBaseMat);
    trackBaseL.position.y = trackH / 2;
    trackGroupL.add(trackBaseL);
    const trackBaseR = new THREE.Mesh(trackBaseGeo, trackBaseMat);
    trackBaseR.position.y = trackH / 2;
    trackGroupR.add(trackBaseR);

    const roadWheelR = trackH * 0.35, roadWheelT = trackW * 0.8;
    const roadWheelGeo = new THREE.CylinderGeometry(roadWheelR, roadWheelR, roadWheelT, 12);
    roadWheelGeo.rotateZ(Math.PI / 2);
    const numRoadWheels = 5;
    for (let i = 0; i < numRoadWheels; i++) {
        const zPos = -tankL/2 * 0.8 + i * (tankL * 0.8 / (numRoadWheels - 1));
        const wheelL = new THREE.Mesh(roadWheelGeo, darkMetalMaterial);
        wheelL.position.set(0, roadWheelR * 0.8, zPos);
        trackGroupL.add(wheelL);
        const wheelR = new THREE.Mesh(roadWheelGeo, darkMetalMaterial);
        wheelR.position.set(0, roadWheelR * 0.8, zPos);
        trackGroupR.add(wheelR);
    }
    const driveWheelR = trackH * 0.45;
    const driveWheelGeo = new THREE.CylinderGeometry(driveWheelR, driveWheelR, roadWheelT*1.1, 16);
    driveWheelGeo.rotateZ(Math.PI / 2);
    const sprocket = new THREE.Mesh(driveWheelGeo, darkMetalMaterial);
    sprocket.position.set(0, driveWheelR, -tankL/2 * 0.85);
    const idler = new THREE.Mesh(driveWheelGeo, darkMetalMaterial);
    idler.position.set(0, driveWheelR, tankL/2 * 0.85);
    trackGroupL.add(sprocket.clone()); trackGroupL.add(idler.clone());
    trackGroupR.add(sprocket.clone()); trackGroupR.add(idler.clone());

    trackGroupL.position.x = -(tankW / 2 + trackW / 2);
    trackGroupR.position.x = (tankW / 2 + trackW / 2);
    trackGroupL.castShadow = true; trackGroupR.castShadow = true;
    group.add(trackGroupL, trackGroupR);

    // Torre (Turret)
    const turretR = tankW * 0.4, turretH = tankH * 0.8;
    const turretGeo = new THREE.CylinderGeometry(turretR*0.8, turretR, turretH, 16);
    const turretMesh = new THREE.Mesh(turretGeo, tankBodyMaterial);
    turretMesh.position.y = hullMesh.position.y + tankH / 2 + turretH / 2;
    turretMesh.position.z = hullMesh.position.z - tankL * 0.1;
    turretMesh.castShadow = true; group.add(turretMesh);

    // Canhão Principal (Main Gun)
    const gunL = tankL * 0.8, gunR = 0.15;
    const gunGeo = new THREE.CylinderGeometry(gunR, gunR * 0.9, gunL, 12);
    const gunMesh = new THREE.Mesh(gunGeo, darkMetalMaterial);
    gunMesh.rotation.x = Math.PI / 2;
    gunMesh.position.set(0, turretMesh.position.y, turretMesh.position.z + turretR*0.5 + gunL/2);
    gunMesh.castShadow = true; group.add(gunMesh);
    const mantletGeo = new THREE.BoxGeometry(turretR*0.6, turretH*0.5, turretR*0.4);
    const mantletMat = tankBodyMaterial.clone();
    mantletMat.color.multiplyScalar(0.9);
    const mantletMesh = new THREE.Mesh(mantletGeo, mantletMat);
    mantletMesh.position.set(0, turretMesh.position.y, turretMesh.position.z + turretR*0.4);
    group.add(mantletMesh);

    // Detalhes
    const hatchGeo = new THREE.CylinderGeometry(turretR*0.2, turretR*0.2, 0.05, 16);
    const hatchMesh = new THREE.Mesh(hatchGeo, darkMetalMaterial);
    hatchMesh.position.set(turretR*0.3, turretMesh.position.y + turretH/2, turretMesh.position.z);
    hatchMesh.rotation.x = Math.PI/2;
    group.add(hatchMesh);
    const antennaBaseGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8);
    const antennaBaseMesh = new THREE.Mesh(antennaBaseGeo, darkMetalMaterial);
    antennaBaseMesh.position.set(-turretR*0.3, turretMesh.position.y + turretH/2, turretMesh.position.z - turretR*0.3);
    group.add(antennaBaseMesh);
    const antennaGeo = new THREE.CylinderGeometry(0.015, 0.01, 0.8, 6);
    const antennaMesh = new THREE.Mesh(antennaGeo, darkMetalMaterial);
    antennaMesh.position.set(antennaBaseMesh.position.x, antennaBaseMesh.position.y + 0.45, antennaBaseMesh.position.z);
    group.add(antennaMesh);

    return group;
}
