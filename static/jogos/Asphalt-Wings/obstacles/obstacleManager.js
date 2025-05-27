import * as THREE from 'three';
import { lanePositions, laneWidth } from '../config.js';

import { createObstacleSedanDetailed } from './sedan.js';
import { createObstacleHatchbackDetailed } from './hatchback.js';
import { createObstacleSUVDetailed } from './suv.js';
import { createObstaclePickupDetailed } from './pickup.js';
import { createObstacleBoxTruckDetailed } from './boxTruck.js';
import { createObstacleTankerTruckDetailed } from './tankerTruck.js';
import { createObstacleVanDetailed } from './van.js';
import { createWarTank } from './warTank.js';
import { createObstaclePencil } from './pencil.js';

// Array com as funções de criação dos obstáculos
const obstacleCreators = [
    createObstacleSedanDetailed,
    createObstacleHatchbackDetailed,
    createObstacleSUVDetailed,
    createObstaclePickupDetailed,
    createObstacleBoxTruckDetailed,
    createObstacleTankerTruckDetailed,
    createObstacleVanDetailed,
    createWarTank,
    createObstaclePencil
];

const twoLanePositions = [
    lanePositions[0],
    lanePositions[1]
];

/**
 * Cria um obstáculo aleatório, adiciona-o à cena e gerencia os arrays associados.
 * @param {THREE.Scene} scene A cena principal.
 * @param {THREE.Mesh} playerCar O mesh do carro do jogador (usado para posicionamento Z).
 * @param {Array<THREE.Group>} obstacles O array que contém os grupos de obstáculos.
 * @param {Array<THREE.Box3>} obstacleColliders O array que contém os colliders dos obstáculos.
 */
export function createObstacle(scene, playerCar, obstacles, obstacleColliders) {
    const randomIndex = Math.floor(Math.random() * obstacleCreators.length);
    const createFunction = obstacleCreators[randomIndex];
    const obstacleGroup = createFunction();

    const spawnDistance = 120;
    let spawnX;

    // Verifica se o obstáculo criado abrange múltiplas faixas
    if (obstacleGroup.userData.laneSpan === 2) {
        const randomTwoLaneIndex = Math.floor(Math.random() * twoLanePositions.length);
        spawnX = twoLanePositions[randomTwoLaneIndex];
    } else {
        const randomLaneIndex = Math.floor(Math.random() * lanePositions.length);
        spawnX = lanePositions[randomLaneIndex];
    }

    obstacleGroup.position.set(
        spawnX,
        0,
        playerCar.position.z + spawnDistance
    );
    obstacleGroup.rotation.y = Math.PI;

    scene.add(obstacleGroup);
    obstacles.push(obstacleGroup);

    const collider = new THREE.Box3();
    collider.setFromObject(obstacleGroup, true).expandByScalar(0.1);
    obstacleColliders.push(collider);
}
