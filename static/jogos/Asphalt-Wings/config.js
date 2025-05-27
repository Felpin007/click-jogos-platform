    import * as THREE from 'three';

// Constantes do Jogo
export const laneWidth = 3;
export const shoulderWidth = 1;
export const roadTotalWidth = laneWidth * 3 + shoulderWidth * 2;
export const lanePositions = [-laneWidth, 0, laneWidth];

export const initialGameSpeed = 0.15;
export const speedIncrement = 0.0002;
export const minGameSpeed = 0.15;
export const maxGameSpeed = 0.45;
export const manualSpeedChange = 0.05;
export const obstacleSpawnInterval = 40;
export const obstacleRelativeSpeed = 0.08;
export const powerupSpawnInterval = 150;
export const wingPowerDuration = 10;
export const wingPowerFlyHeight = 6;

// Constantes do Nitro
export const maxNitro = 100;
export const nitroConsumptionRate = 25;
export const nitroRefillRate = 10;
export const nitroSpeedMultiplier = 1.8;

// Materiais Comuns
export const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.1, roughness: 0.8 });
export const darkWheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.1, roughness: 0.8 });
export const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.3, roughness: 0.2, transparent: true, opacity: 0.7 });
export const darkGlassMaterial = new THREE.MeshStandardMaterial({ color: 0x111122, metalness: 0.2, roughness: 0.3, transparent: true, opacity: 0.6 });
export const chromeMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.2 });
export const darkMetalMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7, roughness: 0.5 });
export const rubberMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
export const tankBodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3f4e3a, metalness: 0.4, roughness: 0.7 });
export const tankTrackMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.6 });

// Materiais Básicos para Luzes
export const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffcc });
export const headlightMaterialOn = new THREE.MeshBasicMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1 });
export const taillightMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 });
export const taillightMaterialOn = new THREE.MeshBasicMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1.5 });
export const indicatorMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

// Materiais para Cidade Distante
export const buildingMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x555565, roughness: 0.8, metalness: 0.1 }),
    new THREE.MeshStandardMaterial({ color: 0x606070, roughness: 0.8, metalness: 0.1 }),
    new THREE.MeshStandardMaterial({ color: 0x4a4a5a, roughness: 0.8, metalness: 0.1 }),
];

// Materiais da Estrada
export const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, side: THREE.DoubleSide, roughness: 0.8, metalness: 0.1 });
export const shoulderMaterial = new THREE.MeshStandardMaterial({ color: 0x282828, side: THREE.DoubleSide, roughness: 0.9, metalness: 0.05 });
export const lineMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
