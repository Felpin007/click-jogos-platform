import * as THREE from 'three';
import { buildingMaterials, roadTotalWidth } from './config.js';

/**
 * Cria o cenário da cidade distante.
 * @param {THREE.Scene} scene A cena para adicionar o cenário.
 * @returns {THREE.Group} O grupo contendo os edifícios da cidade.
 */
export function createCityscape(scene) {
    const cityscapeGroup = new THREE.Group();
    cityscapeGroup.name = "Cityscape";
    const citySpread = 250;
    const cityDepth = 400;
    const buildingCount = 300;
    const cityBaseY = -100;

    const buildingBaseGeo = new THREE.BoxGeometry(1, 1, 1);

    for (let i = 0; i < buildingCount; i++) {
        const material = buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)];
        const building = new THREE.Mesh(buildingBaseGeo, material);

        const scaleX = Math.random() * 8 + 4;
        const scaleY = Math.random() * 100 + 10;
        const scaleZ = Math.random() * 8 + 4;

        building.scale.set(scaleX, scaleY, scaleZ);

        const side = Math.random() < 0.5 ? -1 : 1;
        const minX = roadTotalWidth / 2 + 10;
        const maxX = citySpread / 2;
        const posX = side * (Math.random() * (maxX - minX) + minX);
        const posZ = Math.random() * cityDepth;
        const posY = cityBaseY + scaleY / 2;

        building.position.set(posX, posY, posZ);
        building.castShadow = true;
        building.receiveShadow = true;

        cityscapeGroup.add(building);
    }

    cityscapeGroup.position.set(0, 0, 0);

    scene.add(cityscapeGroup);
    return cityscapeGroup;
}
