import * as THREE from 'three';
import { laneWidth } from '../config.js';

// Lápis Obstáculo
const woodMaterial = new THREE.MeshPhongMaterial({ color: 0xFAD02C, shininess: 10 });
const sharpenedWoodMaterial = new THREE.MeshPhongMaterial({ color: 0xEEDC82, shininess: 5 });
const graphiteMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 20 });
const ferruleMaterial = new THREE.MeshPhongMaterial({ color: 0xCCCCCC, shininess: 80, metalness: 0.5 });
const eraserMaterial = new THREE.MeshPhongMaterial({ color: 0xFFB6C1, shininess: 5 });

export function createObstaclePencil() {
    const group = new THREE.Group();
    group.userData.type = 'pencil';
    group.userData.laneSpan = 2;

    const pencilLength = laneWidth * 6;
    const pencilRadius = laneWidth * 0.4;
    const tipLength = pencilRadius * 3;
    const graphiteLength = tipLength * 0.3;
    const ferruleLength = pencilRadius * 2;
    const eraserLength = pencilRadius * 2.5;

    const bodyLength = pencilLength;
    const sharpenedWoodLength = tipLength - graphiteLength;
    const totalLength = bodyLength + sharpenedWoodLength + graphiteLength + ferruleLength + eraserLength;

    const tipEndY = sharpenedWoodLength + graphiteLength;
    const eraserEndY = -bodyLength - ferruleLength - eraserLength;
    const midpointY = (tipEndY + eraserEndY) / 2;
    const offsetY = -midpointY;
    const verticalLift = pencilRadius * 1.0;
    const worldVerticalOffset = pencilRadius * -1.0;

    // Partes do Lápis
    const createGeometry = (geometry) => {
        return geometry;
    };

    // Corpo Principal (Cilindro Amarelo)
    const bodyGeo = createGeometry(new THREE.CylinderGeometry(pencilRadius, pencilRadius, bodyLength, 16));
    const bodyMesh = new THREE.Mesh(bodyGeo, woodMaterial);
    bodyMesh.position.y = -bodyLength / 2 + offsetY + verticalLift;
    bodyMesh.position.z = worldVerticalOffset;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // Parte de Madeira Apontada (Cone Bege)
    const graphiteRadius = pencilRadius * 0.3;
    const sharpenedWoodGeo = createGeometry(new THREE.ConeGeometry(pencilRadius, sharpenedWoodLength, 16));
    const sharpenedWoodMesh = new THREE.Mesh(sharpenedWoodGeo, sharpenedWoodMaterial);
    sharpenedWoodMesh.position.y = sharpenedWoodLength / 2 + offsetY + verticalLift;
    sharpenedWoodMesh.position.z = worldVerticalOffset;
    sharpenedWoodMesh.castShadow = true;
    group.add(sharpenedWoodMesh);

    // Ponta de Grafite (Cone Cinza Escuro)
    const graphiteGeo = createGeometry(new THREE.ConeGeometry(graphiteRadius, graphiteLength, 16));
    const graphiteMesh = new THREE.Mesh(graphiteGeo, graphiteMaterial);
    graphiteMesh.position.y = sharpenedWoodLength + graphiteLength / 2 - (graphiteLength * 0.5) + offsetY + verticalLift;
    graphiteMesh.position.z = worldVerticalOffset;
    graphiteMesh.castShadow = true;
    group.add(graphiteMesh);

    // Ponteira de Metal (Cilindro Prateado)
    const ferruleRadius = pencilRadius * 1.05;
    const ferruleGeo = createGeometry(new THREE.CylinderGeometry(ferruleRadius, ferruleRadius, ferruleLength, 16));
    const ferruleMesh = new THREE.Mesh(ferruleGeo, ferruleMaterial);
    ferruleMesh.position.y = -bodyLength - ferruleLength / 2 + offsetY + verticalLift;
    ferruleMesh.position.z = worldVerticalOffset;
    ferruleMesh.castShadow = true;
    group.add(ferruleMesh);

    // Borracha (Cilindro Rosa)
    const eraserGeo = createGeometry(new THREE.CylinderGeometry(ferruleRadius * 0.95, ferruleRadius * 0.95, eraserLength, 16));
    const eraserMesh = new THREE.Mesh(eraserGeo, eraserMaterial);
    eraserMesh.position.y = -bodyLength - ferruleLength - eraserLength / 2 + offsetY + verticalLift;
    eraserMesh.position.z = worldVerticalOffset;
    eraserMesh.castShadow = true;
    group.add(eraserMesh);

    group.rotation.x = -Math.PI / 2;

    return group;
}
