import * as THREE from 'three';
import { darkWheelMaterial, chromeMaterial } from './config.js';

/**
 * Cria rodas detalhadas (pneu + aro) e as adiciona a um grupo de veículo.
 * @param {THREE.Group} vehicleGroup O grupo para adicionar as rodas.
 * @param {number} numAxles Número de eixos para o veículo.
 * @param {number} wheelRadius Raio das rodas.
 * @param {number} wheelThickness Espessura das rodas.
 * @param {number} bodyWidth Largura do corpo do veículo (para posicionamento).
 * @param {number} bodyLength Comprimento do corpo do veículo (para posicionamento).
 * @param {number} yOffset Deslocamento vertical para o centro da roda (geralmente 0).
 * @param {THREE.Material} [rimMaterial=chromeMaterial] Material para os aros das rodas.
 */
export function addDetailedWheels(vehicleGroup, numAxles, wheelRadius, wheelThickness, bodyWidth, bodyLength, yOffset, rimMaterial = chromeMaterial) {
    const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 24);
    wheelGeo.rotateZ(Math.PI / 2);
    const rimR = wheelRadius * 0.7, rimT = wheelThickness * 1.05;
    const rimGeo = new THREE.CylinderGeometry(rimR, rimR, rimT, 16);
    rimGeo.rotateZ(Math.PI / 2);

    const wheelXOffset = bodyWidth / 2 + wheelThickness * 0.1;

    for (let i = 0; i < numAxles; i++) {
        let wheelZOffset;
        if (numAxles <= 2) {
            wheelZOffset = bodyLength / 2 * 0.75 * (i === 0 ? 1 : -1);
        } else {
            const rearAxleSpacing = wheelRadius * 2.5;
            if (i === 0) wheelZOffset = bodyLength / 2 * 0.8;
            else wheelZOffset = -bodyLength / 2 * 0.5 - (i - 1) * rearAxleSpacing;
        }

        function createSingleWheel(sideMultiplier) {
            const wheelGrp = new THREE.Group();
            const tireMesh = new THREE.Mesh(wheelGeo, darkWheelMaterial);
            const rimMesh = new THREE.Mesh(rimGeo, rimMaterial);
            wheelGrp.add(tireMesh, rimMesh);
            wheelGrp.position.set(wheelXOffset * sideMultiplier, yOffset + wheelRadius, wheelZOffset);
            wheelGrp.castShadow = true;
            return wheelGrp;
        }
        vehicleGroup.add(createSingleWheel(-1));
        vehicleGroup.add(createSingleWheel(1));
    }
}
