import * as THREE from 'three';

// Função de Criação do Power-up
export function createWingPowerup() {
    const group = new THREE.Group();
    group.userData.type = 'powerup';
    group.userData.powerupType = 'wings';

    const wingColor = 0xffd700;
    const wingMaterial = new THREE.MeshStandardMaterial({
        color: wingColor,
        metalness: 0.8,
        roughness: 0.3,
        emissive: wingColor,
        emissiveIntensity: 0.4
    });

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(0.8, 0.2);
    wingShape.lineTo(1.0, 0.8);
    wingShape.lineTo(0.5, 0.6);
    wingShape.lineTo(0.2, 1.0);
    wingShape.lineTo(0, 0.5);
    wingShape.lineTo(0, 0);

    const extrudeSettings = { depth: 0.1, bevelEnabled: false };
    const wingGeometry = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);

    const wing1 = new THREE.Mesh(wingGeometry, wingMaterial);
    wing1.rotation.z = Math.PI / 6;
    wing1.scale.set(1.2, 1.2, 1.2);

    const wing2 = wing1.clone();
    wing2.rotation.z = -Math.PI / 6;
    wing2.scale.x = -1.2;

    group.add(wing1);
    group.add(wing2);

    const baseGeo = new THREE.SphereGeometry(0.3, 16, 8);
    const baseMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.5;
    group.add(baseMesh);

    group.position.y = 1.0;

    group.userData.spinSpeed = Math.PI * 1.5;

    return group;
}
