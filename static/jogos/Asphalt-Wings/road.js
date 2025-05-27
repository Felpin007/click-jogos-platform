import * as THREE from 'three';
import {
    laneWidth,
    shoulderWidth,
    lanePositions,
    roadMaterial,
    shoulderMaterial,
    lineMaterial
} from './config.js';

/**
 * Cria um único segmento da estrada.
 * @param {number} zPosition A posição Z onde o segmento deve ser colocado.
 * @param {THREE.Scene} scene A cena para adicionar o segmento de estrada.
 * @returns {{mesh: THREE.Group, length: number, leftLight: THREE.SpotLight, rightLight: THREE.SpotLight}} Um objeto contendo o Grupo do segmento, seu comprimento e referências aos seus spotlights.
 */
export function createRoadSegment(zPosition, scene) {
    const segmentLength = 50;
    const segmentGroup = new THREE.Group();
    segmentGroup.position.z = zPosition;

    // Superfície da Estrada
    const roadGeometry = new THREE.PlaneGeometry(laneWidth * 3, segmentLength);
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.receiveShadow = true;
    segmentGroup.add(roadMesh);

    // Acostamentos
    const shoulderGeometry = new THREE.PlaneGeometry(shoulderWidth, segmentLength);
    const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    leftShoulder.rotation.x = -Math.PI / 2;
    leftShoulder.position.set(-(laneWidth * 1.5 + shoulderWidth / 2), -0.01, 0);
    leftShoulder.receiveShadow = true;
    segmentGroup.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    rightShoulder.rotation.x = -Math.PI / 2;
    rightShoulder.position.set((laneWidth * 1.5 + shoulderWidth / 2), -0.01, 0);
    rightShoulder.receiveShadow = true;
    segmentGroup.add(rightShoulder);

    // Postes de Luz
    const streetlightHeight = 5;
    const streetlightRadius = 0.1;
    const lightRadius = 0.3;
    const poleGeometry = new THREE.CylinderGeometry(streetlightRadius, streetlightRadius, streetlightHeight);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const lightGeometry = new THREE.SphereGeometry(lightRadius);
    const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF99 });
    const armLength = 1.5;
    const armRadius = 0.08;
    const armGeometry = new THREE.CylinderGeometry(armRadius, armRadius, armLength);

    const poleYPosition = streetlightHeight / 2;
    const armYPosition = streetlightHeight - armRadius;
    const lightYPosition = armYPosition;

    const poleXOffset = laneWidth * 1.5 + shoulderWidth;
    const armXOffset = poleXOffset - armLength / 2;
    const lightXOffset = poleXOffset - armLength;

    // Poste Esquerdo
    const leftStreetlightGroup = new THREE.Group();

    const leftPole = new THREE.Mesh(poleGeometry, poleMaterial);
    leftPole.position.y = poleYPosition;
    leftPole.castShadow = true;
    leftStreetlightGroup.add(leftPole);

    // Braço Esquerdo
    const leftArm = new THREE.Mesh(armGeometry, poleMaterial);
    leftArm.rotation.z = Math.PI / 2;
    leftArm.position.set(armLength / 2, armYPosition, 0);
    leftArm.castShadow = true;
    leftStreetlightGroup.add(leftArm);

    // Luz Esquerda
    const leftLight = new THREE.Mesh(lightGeometry, lightMaterial);
    leftLight.position.set(armLength, lightYPosition, 0);
    leftStreetlightGroup.add(leftLight);

    // Spotlight Otimizado
    const leftSpotLight = new THREE.SpotLight(0xFFFFDD, 0, 15, Math.PI / 2.5, 0.5, 1.5);
    leftSpotLight.position.set(armLength, lightYPosition - 0.2, 0);
    leftSpotLight.target.position.set(armLength + 0.5, 0, 0);
    leftSpotLight.castShadow = false;
    leftSpotLight.visible = false;
    leftSpotLight.name = "streetlightSpotlight";
    leftStreetlightGroup.add(leftSpotLight);
    leftStreetlightGroup.add(leftSpotLight.target);

    leftStreetlightGroup.position.set(-poleXOffset, 0, 0);
    segmentGroup.add(leftStreetlightGroup);

    // Poste Direito
    const rightStreetlightGroup = new THREE.Group();

    const rightPole = new THREE.Mesh(poleGeometry, poleMaterial);
    rightPole.position.y = poleYPosition;
    rightPole.castShadow = true;
    rightStreetlightGroup.add(rightPole);

    // Braço Direito
    const rightArm = new THREE.Mesh(armGeometry, poleMaterial);
    rightArm.rotation.z = -Math.PI / 2;
    rightArm.position.set(-armLength / 2, armYPosition, 0);
    rightArm.castShadow = true;
    rightStreetlightGroup.add(rightArm);

    // Luz Direita
    const rightLight = new THREE.Mesh(lightGeometry, lightMaterial);
    rightLight.position.set(-armLength, lightYPosition, 0);
    rightStreetlightGroup.add(rightLight);

    // Spotlight Otimizado
    const rightSpotLight = new THREE.SpotLight(0xFFFFDD, 0, 15, Math.PI / 2.5, 0.5, 1.5);
    rightSpotLight.position.set(-armLength, lightYPosition - 0.2, 0);
    rightSpotLight.target.position.set(-armLength - 0.5, 0, 0);
    rightSpotLight.castShadow = false;
    rightSpotLight.visible = false;
    rightSpotLight.name = "streetlightSpotlight";
    rightStreetlightGroup.add(rightSpotLight);
    rightStreetlightGroup.add(rightSpotLight.target);

    rightStreetlightGroup.position.set(poleXOffset, 0, 0);
    segmentGroup.add(rightStreetlightGroup);

    // Linhas de Faixa
    const lineYOffset = 0.02;
    const dashLength = 2;
    const gapLength = 3;
    const numberOfDashes = Math.floor(segmentLength / (dashLength + gapLength));

    for (let i = 1; i < 3; i++) {
        const lineX = lanePositions[i] - laneWidth / 2;
        for (let j = 0; j < numberOfDashes; j++) {
            const startZ = j * (dashLength + gapLength) - segmentLength / 2;
            const endZ = startZ + dashLength;
            const points = [new THREE.Vector3(lineX, lineYOffset, startZ), new THREE.Vector3(lineX, lineYOffset, endZ)];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const laneLine = new THREE.Line(lineGeometry, lineMaterial);
            segmentGroup.add(laneLine);
        }
    }

    scene.add(segmentGroup);
    return { mesh: segmentGroup, length: segmentLength, leftLight: leftSpotLight, rightLight: rightSpotLight };
}

/**
 * Cria o conjunto inicial de segmentos de estrada, incluindo referências aos seus spotlights.
 * @param {THREE.Scene} scene A cena para adicionar os segmentos de estrada.
 * @returns {Array<{mesh: THREE.Group, length: number, leftLight: THREE.SpotLight, rightLight: THREE.SpotLight}>} Um array dos segmentos de estrada criados com referências de luz.
 */
export function createInitialRoad(scene) {
    const segmentsNeeded = 6;
    let currentZ = 0;
    const roadSegments = [];
    for (let i = 0; i < segmentsNeeded; i++) {
        const segment = createRoadSegment(currentZ - i * 50, scene);
        roadSegments.push(segment);
    }
    return roadSegments;
}
