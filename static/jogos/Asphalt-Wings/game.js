import * as THREE from 'three';
import {
    lanePositions,
    initialGameSpeed,
    minGameSpeed,
    maxGameSpeed,
    manualSpeedChange,
    obstacleSpawnInterval,
    obstacleRelativeSpeed,
    powerupSpawnInterval,
    wingPowerDuration,
    wingPowerFlyHeight,
    maxNitro,
    nitroConsumptionRate,
    nitroRefillRate,
    nitroSpeedMultiplier,
    headlightMaterial,
    headlightMaterialOn,
    taillightMaterial,
    taillightMaterialOn
} from './config.js';
import { createPlayerCar } from './player.js';
import { createInitialRoad, createRoadSegment } from './road.js';
import { createCityscape } from './cityscape.js';
import { createObstacle } from './obstacles/obstacleManager.js';
import { createWingPowerup } from './obstacles/powerup.js';

// Variáveis Globais
let scene, camera, renderer;
let ambientLight, directionalLight;
let playerCar, playerCollider;
let roadSegments = [];
let obstacles = [];
let obstacleColliders = [];
let powerups = [];
let powerupColliders = [];
let cityscapeGroup;
let starField;

let currentLane = 1;
let targetLane = 1;

let score = 0;
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const speedometerNeedle = document.getElementById('speedometer-needle');
const speedometerText = document.getElementById('speedometer-text');
const clockElement = document.getElementById('clock');
const nitroBarFill = document.getElementById('nitro-bar-fill');
const pauseMenu = document.getElementById('pause-menu');
const resumeButton = document.getElementById('resume-button');
const cameraAnimationsToggle = document.getElementById('camera-animations-toggle');

// Variáveis de Tempo e Iluminação
let gameHour = 8;
let gameMinute = 0;
const timeSpeedFactor = 1 / 6;
const dayDurationHours = 24;

let gameSpeed = initialGameSpeed;
let targetSpeed = initialGameSpeed;
let obstacleSpawnTimer = 0;
let powerupSpawnTimer = 0;

let clock = new THREE.Clock();
let isGameOver = false;
let isPaused = false;
let cameraAnimationsEnabled = true;
let headlightsOn = false;
let currentNitro = maxNitro;
let isNitroActive = false;
let animationFrameId;
let isFirstPerson = false;
const thirdPersonCameraOffset = { x: 0, y: 5, z: -8 };

// Input state tracking
const keysPressed = {
    'ArrowUp': false,
    'ArrowDown': false,
    'ArrowLeft': false,
    'ArrowRight': false,
    'w': false,
    's': false,
    'a': false,
    'd': false,
    'Shift': false,
    ' ': false
};

// Criação de Estrelas
function createStars() {
    const starGroup = new THREE.Group();
    starGroup.name = "StarField";

    const starMaterial = new THREE.SpriteMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false
    });

    const starCount = 3000;
    const radius = 200;
    const starSize = 0.3;

    for (let i = 0; i < starCount; i++) {
        const phi = Math.acos(-1 + (2 * Math.random()));
        const theta = Math.random() * Math.PI * 2;

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        if (y > -radius * 0.1) {
            const starSprite = new THREE.Sprite(starMaterial);
            starSprite.position.set(x, y, z);
            starSprite.scale.set(starSize, starSize, 1.0);
            starGroup.add(starSprite);
        }
    }

    return starGroup;
}

// Inicialização
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0xaaaaaa, 10, 120);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, -8);
    camera.lookAt(0, 1, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Iluminação
    ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(15, 25, -10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    // Criação de Objetos do Jogo
    const player = createPlayerCar();
    playerCar = player.carGroup;
    playerCollider = player.collider;
    scene.add(playerCar);

    roadSegments = createInitialRoad(scene);
    cityscapeGroup = createCityscape(scene);
    starField = createStars();
    scene.add(starField);

    // Listeners de Eventos
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', onWindowResize);
    restartButton.addEventListener('click', restartGame);
    resumeButton.addEventListener('click', togglePause);
    cameraAnimationsToggle.addEventListener('change', handleCameraToggle);

    // Iniciar Jogo
    resetGameVariables();
    cameraAnimationsToggle.checked = cameraAnimationsEnabled;
    updateGameTimeAndLighting(0);
    animate();
}

// Gerenciamento do Estado do Jogo
function resetGameVariables() {
    score = 0;
    gameSpeed = initialGameSpeed;
    targetSpeed = initialGameSpeed;
    currentLane = 1;
    targetLane = 1;

    if (playerCar && camera) {
        playerCar.position.x = lanePositions[currentLane];
        playerCar.position.z = 0;
        playerCar.rotation.y = 0;

        camera.position.set(0, 5, playerCar.position.z - 8);
        camera.rotation.set(0, 0, 0);
        camera.lookAt(0, 1, 0);
    }

    // Limpar obstáculos existentes
    obstacles.forEach(obstacleGroup => {
        while (obstacleGroup.children.length > 0) {
            const child = obstacleGroup.children[0];
            obstacleGroup.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }
        scene.remove(obstacleGroup);
    });
    obstacles = [];
    obstacleColliders = [];
    
    powerups.forEach(powerupGroup => {
        if (scene && powerupGroup) {
            scene.remove(powerupGroup);
            while (powerupGroup.children.length > 0) {
                const child = powerupGroup.children[0];
                powerupGroup.remove(child);
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        }
    });
    powerups = [];
    powerupColliders = [];

    // Limpar segmentos de estrada existentes
    roadSegments.forEach(segment => {
        while(segment.mesh.children.length > 0){
             const child = segment.mesh.children[0];
             segment.mesh.remove(child);
             if(child.geometry) child.geometry.dispose();
             if(child.material) {
                 if (Array.isArray(child.material)) {
                     child.material.forEach(m => m.dispose());
                 } else {
                     child.material.dispose();
                 }
             }
        }
        scene.remove(segment.mesh);
    });
    roadSegments = [];

    // Resetar posição do cenário
    if (cityscapeGroup) {
        cityscapeGroup.position.z = 0;
    } else {
        cityscapeGroup = createCityscape(scene);
    }

    obstacleSpawnTimer = 0;
    powerupSpawnTimer = 0;

    // Recriar estrada inicial
    if (scene) {
        roadSegments = createInitialRoad(scene);
    }

    // Resetar UI
    scoreElement.textContent = `Pontuação: 0`;
    gameOverElement.style.display = 'none';
    pauseMenu.style.display = 'none';
    isGameOver = false;
    isPaused = false;

    // Resetar estado do power-up
    hasWingPower = false;
    wingPowerTimer = 0;
    if (powerupIndicator) powerupIndicator.style.display = 'none';
    if (playerCar) playerCar.position.y = 0;

    // Resetar Nitro
    currentNitro = maxNitro;
    isNitroActive = false;
    updateNitroUI();
}

function gameOver() {
    if (isGameOver) return;
    console.log("Game Over!");
    isGameOver = true;
    isPaused = false;
    pauseMenu.style.display = 'none';
    cancelAnimationFrame(animationFrameId);
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'flex';

    hasWingPower = false;
    wingPowerTimer = 0;
    if (powerupIndicator) powerupIndicator.style.display = 'none';
}

function restartGame() {
    if (!isGameOver) return;
    resetGameVariables();

    gameHour = 8;
    gameMinute = 0;
    updateGameTimeAndLighting(0);

    animate();
}

// Alternar Pausa
function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        cancelAnimationFrame(animationFrameId);
        clock.stop();
        pauseMenu.style.display = 'flex';
        cameraAnimationsToggle.checked = cameraAnimationsEnabled;
    } else {
        clock.start();
        animate();
        pauseMenu.style.display = 'none';
    }
}

// Manipulador de Alternância da Câmera
function handleCameraToggle() {
    cameraAnimationsEnabled = cameraAnimationsToggle.checked;
    if (!cameraAnimationsEnabled && isPaused && camera && playerCar) {
        camera.position.set(0, 5, playerCar.position.z - 8);
        camera.rotation.set(0, 0, 0);
        camera.lookAt(0, 1, 0);
    }
}

// Controle do Jogador
function handleKeyDown(event) {
    if (event.key === 'Escape') {
        if (!isGameOver) {
             togglePause();
        }
        return;
    }

    if (isPaused || isGameOver) return;

    const key = event.key;
    const lowerKey = key.toLowerCase();

    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 's', 'a', 'd', ' ', 'shift', 'v'].includes(lowerKey)) {
        event.preventDefault();
    }

    if (keysPressed.hasOwnProperty(key)) {
        keysPressed[key] = true;
    } else if (keysPressed.hasOwnProperty(lowerKey)) {
        keysPressed[lowerKey] = true;
    }

    // Ativar Power-up de Asa
    if (key === 'Shift' && hasWingPower && wingPowerTimer <= 0) {
        console.log("Activating Wing Power!");
        wingPowerTimer = wingPowerDuration;
        hasWingPower = false;
        if (powerupIndicator) powerupIndicator.style.display = 'none';
        missilesLeft = MAX_MISSILES;
    }

    // Alternar Faróis
    if (key.toLowerCase() === 'k') {
        headlightsOn = !headlightsOn;
        console.log("Headlights Toggled:", headlightsOn);
    }

    // Ativação do Nitro (Barra de Espaço)
    if (key === ' ' && currentNitro > 0) {
        isNitroActive = true;
    }

    // Alternar visão em primeira pessoa com a tecla V
    if (lowerKey === 'v') {
        isFirstPerson = !isFirstPerson;
        if (!isFirstPerson) {
            camera.position.set(
                thirdPersonCameraOffset.x,
                thirdPersonCameraOffset.y + playerCar.position.y,
                playerCar.position.z + thirdPersonCameraOffset.z
            );
            camera.rotation.set(0, 0, 0);
        }
    }
}

function handleKeyUp(event) {
    if (isGameOver) return;
    const key = event.key;

     if (keysPressed.hasOwnProperty(key)) {
        keysPressed[key] = false;
    } else {
        const lowerKey = key.toLowerCase();
        if (keysPressed.hasOwnProperty(lowerKey)) {
            keysPressed[lowerKey] = false;
        }
    }

    // Desativação do Nitro (Barra de Espaço)
    if (key === ' ') {
        isNitroActive = false;
    }
}

// Atualização de Velocidade
const decelerationFactor = 0.05;
const accelerationFactor = 0.5;
const brakingFactor = 1.5;

// Manipulação de Entrada (chamado a cada quadro)
function handlePlayerInput(delta) {
    // Controle de Velocidade
    let speedChange = 0;
    if (keysPressed['ArrowUp'] || keysPressed['w']) {
        speedChange += manualSpeedChange;
    }
    if (keysPressed['ArrowDown'] || keysPressed['s']) {
        speedChange -= manualSpeedChange * brakingFactor;
    }

    targetSpeed += speedChange * delta * 60;

    if (!(keysPressed['ArrowUp'] || keysPressed['w'])) {
        targetSpeed -= decelerationFactor * delta * 60;
    }

    targetSpeed = Math.max(minGameSpeed, Math.min(maxGameSpeed, targetSpeed));

    // Controle de Faixa
    if (keysPressed['ArrowLeft'] || keysPressed['a']) {
        targetLane = Math.min(lanePositions.length - 1, currentLane + 1);
    } else if (keysPressed['ArrowRight'] || keysPressed['d']) {
        targetLane = Math.max(0, currentLane - 1);
    }
}

// Atualização do Nitro
function updateNitro(delta) {
    if (isNitroActive && currentNitro > 0) {
        currentNitro -= nitroConsumptionRate * delta;
        currentNitro = Math.max(0, currentNitro);
        if (currentNitro === 0) {
            isNitroActive = false;
            keysPressed[' '] = false;
        }
    } else if (!isNitroActive && currentNitro < maxNitro) {
        currentNitro += nitroRefillRate * delta;
        currentNitro = Math.min(maxNitro, currentNitro);
    }
}

// Atualização de Velocidade (incorpora Nitro)
function updateGameSpeed(delta) {
    const currentMaxSpeed = isNitroActive ? maxGameSpeed * nitroSpeedMultiplier : maxGameSpeed;
    const currentMinSpeed = minGameSpeed;

    let baseLerpedSpeed = THREE.MathUtils.lerp(gameSpeed, targetSpeed, accelerationFactor * delta);

    let finalSpeed = isNitroActive ? baseLerpedSpeed * nitroSpeedMultiplier : baseLerpedSpeed;

    gameSpeed = Math.max(currentMinSpeed, Math.min(currentMaxSpeed, finalSpeed));
}

// Atualização da Posição do Jogador e Power-up
function updatePlayerPosition(delta) {
    if (!playerCar) return;

    // Mudança de Faixa
    const laneLerpSpeed = 10 * delta;
    playerCar.position.x = THREE.MathUtils.lerp(playerCar.position.x, lanePositions[targetLane], laneLerpSpeed);

    if (Math.abs(playerCar.position.x - lanePositions[targetLane]) < 0.05) {
        currentLane = targetLane;
        playerCar.position.x = lanePositions[targetLane];
    }

    // Voo do Power-up de Asa e Animação da Asa
    const flyLerpSpeed = 3 * delta;
    const wingScaleSpeed = 5 * delta;
    let targetY = 0;
    let targetWingScaleFactor = 0.01;

    if (wingPowerTimer > 0) {
        targetY = wingPowerFlyHeight;
        targetWingScaleFactor = 1.0;
        wingPowerTimer -= delta;

        if (wingPowerTimer <= 0) {
            console.log("Wing Power Expired!");
        }
    }

    playerCar.position.y = THREE.MathUtils.lerp(playerCar.position.y, targetY, flyLerpSpeed);

    const leftWing = playerCar.getObjectByName("leftWing");
    const rightWing = playerCar.getObjectByName("rightWing");
    const baseWingLength = 3.5;

    if (leftWing) {
        const currentFactor = leftWing.scale.x / baseWingLength;
        const newFactor = THREE.MathUtils.lerp(currentFactor, targetWingScaleFactor, wingScaleSpeed);
        leftWing.scale.x = newFactor * baseWingLength;
    }
    if (rightWing) {
        const currentFactor = Math.abs(rightWing.scale.x / baseWingLength);
        const newFactor = THREE.MathUtils.lerp(currentFactor, targetWingScaleFactor, wingScaleSpeed);
        rightWing.scale.x = -newFactor * baseWingLength;
    }

    // Atualização da Câmera
    const initialCameraOffsetY = 5;

    if (isFirstPerson) {
        camera.position.set(
            playerCar.position.x,
            playerCar.position.y + 1.2,
            playerCar.position.z + 1.5
        );
        camera.lookAt(
            playerCar.position.x,
            playerCar.position.y + 1.2,
            playerCar.position.z + 30
        );
    } else if (cameraAnimationsEnabled) {
        const cameraLagFactor = 5 * delta;
        const bobbingFrequency = gameSpeed * 15;
        const bobbingAmplitude = 0.05 + gameSpeed * 0.05;
        const time = clock.getElapsedTime();

        const verticalBob = playerCar.position.y < 0.1 ? Math.sin(time * bobbingFrequency) * bobbingAmplitude : 0;

        const cameraTargetX = playerCar.position.x * 0.5;
        const cameraTargetY = playerCar.position.y + thirdPersonCameraOffset.y + verticalBob;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, cameraTargetX, cameraLagFactor);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, cameraTargetY, flyLerpSpeed);

        // Inclinação da Câmera
        const tiltFactor = 0.05;
        const tiltSpeed = 5 * delta;
        const horizontalDiff = cameraTargetX - camera.position.x;
        const targetTilt = horizontalDiff * tiltFactor;

        camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetTilt, tiltSpeed);

        camera.lookAt(playerCar.position.x * 0.2, playerCar.position.y + 1, playerCar.position.z + 5);

    } else {
        camera.position.x = thirdPersonCameraOffset.x;
        const cameraTargetY = playerCar.position.y + thirdPersonCameraOffset.y;
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, cameraTargetY, flyLerpSpeed);
        camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, 0, 5 * delta);
        camera.lookAt(0, 1, playerCar.position.z + 5);
    }
}

// Atualização do Mundo
function updateWorld(delta) {
    if (!playerCar || !camera) return;

    const worldMovement = gameSpeed * 60 * delta;

    // Lógica de Reciclagem de Segmentos da Estrada
    roadSegments.forEach(segment => {
        segment.mesh.position.z -= worldMovement;
    });

    let currentMaxZ = -Infinity;
    roadSegments.forEach(segment => {
        if (segment.mesh.position.z > currentMaxZ) {
            currentMaxZ = segment.mesh.position.z;
        }
    });
    if (currentMaxZ === -Infinity && roadSegments.length > 0) {
        currentMaxZ = camera.position.z;
    }

    let segmentsRepositionedThisFrame = 0;
    const recycleThreshold = roadSegments.length > 0 ? camera.position.z - roadSegments[0].length : camera.position.z;

    roadSegments.forEach(segment => {
        if (segment.mesh.position.z < recycleThreshold) {
            const segmentLength = segment.length;
            const newPosition = currentMaxZ + (segmentsRepositionedThisFrame + 1) * segmentLength;
            segment.mesh.position.z = newPosition;
            segmentsRepositionedThisFrame++;
        }
    });

    // Mover Cenário da Cidade (Efeito Parallax)
    if (cityscapeGroup) {
        const citySpeedFactor = 0.05;
        cityscapeGroup.position.z -= worldMovement * citySpeedFactor;

        if (cityscapeGroup.position.z < -200) {
            cityscapeGroup.position.z += 400;
        }
    }

    // Mover Obstáculos e Atualizar Colliders com Velocidades Variadas
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacleGroup = obstacles[i];
        const collider = obstacleColliders[i];
        const type = obstacleGroup.userData.type || 'car';

        let typeSpeedFactor = obstacleRelativeSpeed;

        switch (type) {
            case 'car':
                typeSpeedFactor = obstacleRelativeSpeed * (3.0 + (Math.random() - 0.5) * 1.5);
                break;
            case 'van':
                typeSpeedFactor = obstacleRelativeSpeed * (1.5 + (Math.random() - 0.5) * 0.5);
                break;
            case 'truck':
                typeSpeedFactor = obstacleRelativeSpeed * (0.8 + (Math.random() - 0.5) * 0.25);
                break;
        }

        typeSpeedFactor = Math.max(0.01, typeSpeedFactor);

        const obstacleSpecificMovement = typeSpeedFactor * 60 * delta;
        obstacleGroup.position.z -= (worldMovement + obstacleSpecificMovement);

        collider.setFromObject(obstacleGroup, true).expandByScalar(0.1);

        if (obstacleGroup.position.z < camera.position.z - 40) {
            while(obstacleGroup.children.length > 0){
                const child = obstacleGroup.children[0];
                obstacleGroup.remove(child);
                if(child.geometry) child.geometry.dispose();
                if(child.material) {
                     if (Array.isArray(child.material)) {
                         child.material.forEach(m => m.dispose());
                     } else {
                         child.material.dispose();
                     }
                }
            }
            scene.remove(obstacleGroup);
            obstacles.splice(i, 1);
            obstacleColliders.splice(i, 1);
        }
    }

    // Mover Power-ups e Atualizar Colliders e Animar
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerupGroup = powerups[i];
        const collider = powerupColliders[i];

        powerupGroup.position.z -= worldMovement;

        if (powerupGroup.userData.spinSpeed) {
            powerupGroup.rotation.y += powerupGroup.userData.spinSpeed * delta;
        }

        collider.setFromObject(powerupGroup, true);

        if (powerupGroup.position.z < camera.position.z - 40) {
            while(powerupGroup.children.length > 0){
                const child = powerupGroup.children[0];
                powerupGroup.remove(child);
                if(child.geometry) child.geometry.dispose();
                if(child.material) {
                     if (Array.isArray(child.material)) {
                         child.material.forEach(m => m.dispose());
                     } else {
                         child.material.dispose();
                     }
                }
            }
            scene.remove(powerupGroup);
            powerups.splice(i, 1);
            powerupColliders.splice(i, 1);
        }
    }

    // Aumentar Pontuação
    score += Math.floor(worldMovement * 10);
    scoreElement.textContent = `Pontuação: ${score}`;

    // Gerar Novos Obstáculos
    obstacleSpawnTimer += worldMovement;
    if (obstacleSpawnTimer > obstacleSpawnInterval) {
        createObstacle(scene, playerCar, obstacles, obstacleColliders);
        obstacleSpawnTimer = 0;
    }

    // Gerar Novos Power-ups
    powerupSpawnTimer += worldMovement;
    if (powerupSpawnTimer > powerupSpawnInterval) {
        const powerupGroup = createWingPowerup();
        const randomLaneIndex = Math.floor(Math.random() * lanePositions.length);
        const spawnDistance = 150;
        powerupGroup.position.set(
            lanePositions[randomLaneIndex],
            powerupGroup.position.y,
            playerCar.position.z + spawnDistance
        );

        scene.add(powerupGroup);
        powerups.push(powerupGroup);

        const collider = new THREE.Box3();
        collider.setFromObject(powerupGroup, true);
        powerupColliders.push(collider);

        powerupSpawnTimer = 0;
    }
}

// Estado do Power-up
let hasWingPower = false;
let wingPowerTimer = 0;
const powerupIndicator = document.getElementById('powerup-indicator');

// Detecção de Colisões
function checkCollisions() {
    if (!playerCar || !playerCollider || isGameOver) return;

    playerCollider.setFromObject(playerCar, true);

    for (let i = 0; i < obstacleColliders.length; i++) {
        if (playerCollider.intersectsBox(obstacleColliders[i])) {
            if (!hasWingPower || wingPowerTimer <= 0) {
                 gameOver();
                 break;
            }
        }
    }

    for (let i = powerups.length - 1; i >= 0; i--) {
        if (playerCollider.intersectsBox(powerupColliders[i])) {
            const powerupGroup = powerups[i];
            console.log("Power-up collected:", powerupGroup.userData.powerupType);

            if (powerupGroup.userData.powerupType === 'wings') {
                hasWingPower = true;
                wingPowerTimer = 0;
                if (powerupIndicator) powerupIndicator.style.display = 'block';
            }

            while(powerupGroup.children.length > 0){
                const child = powerupGroup.children[0];
                powerupGroup.remove(child);
                if(child.geometry) child.geometry.dispose();
                if(child.material) {
                     if (Array.isArray(child.material)) {
                         child.material.forEach(m => m.dispose());
                     } else {
                         child.material.dispose();
                     }
                }
            }
            scene.remove(powerupGroup);
            powerups.splice(i, 1);
            powerupColliders.splice(i, 1);

            break;
        }
    }
}

// Redimensionar Janela
function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Loop de Animação
function animate() {
    animationFrameId = requestAnimationFrame(animate);

    if (isPaused || isGameOver) {
        if (renderer && scene && camera) {
             renderer.render(scene, camera);
        }
        return;
    }

    const delta = clock.running ? Math.min(clock.getDelta(), 0.05) : 0;

    handlePlayerInput(delta);
    updateGameSpeed(delta);
    updateNitro(delta);
    updatePlayerPosition(delta);
    updateWorld(delta);
    checkCollisions();
    updateSpeedometer();
    updateNitroUI();
    updateGameTimeAndLighting(delta);
    updatePlayerLights();
    updateCrosshairVisibility();
    updateMissiles(delta);
    updateCrosshairPosition();

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Atualização do Velocímetro
function updateSpeedometer() {
    if (!speedometerNeedle || !speedometerText) return;

    const minKmh = 80;
    const maxKmhWithoutNitro = 240;
    const baseSpeedRange = maxGameSpeed - minGameSpeed;
    const baseKmhRange = maxKmhWithoutNitro - minKmh;

    const maxPossibleGameSpeed = maxGameSpeed * nitroSpeedMultiplier;

    const maxPossibleKmh = minKmh + ((maxPossibleGameSpeed - minGameSpeed) / baseSpeedRange) * baseKmhRange;

    const currentKmh = minKmh + ((gameSpeed - minGameSpeed) / baseSpeedRange) * baseKmhRange;

    const totalKmhRange = maxPossibleKmh - minKmh;

    const rotationRange = 180;
    let needleRotation = -90;

    if (totalKmhRange > 0) {
        const speedProportion = (currentKmh - minKmh) / totalKmhRange;
        const clampedProportion = Math.max(0, Math.min(1, speedProportion));
        needleRotation = -90 + (clampedProportion * rotationRange);
    }

    speedometerNeedle.style.transform = `translateX(-50%) rotate(${needleRotation}deg)`;
    speedometerText.textContent = `${Math.round(currentKmh)} km/h`;
}

// Atualização da UI do Nitro
function updateNitroUI() {
    if (!nitroBarFill) return;
    const nitroPercentage = (currentNitro / maxNitro) * 100;
    nitroBarFill.style.width = `${nitroPercentage}%`;
}

// Atualização de Tempo e Iluminação
function updateGameTimeAndLighting(delta) {
    if (isGameOver || !scene || !ambientLight || !directionalLight || !clockElement) return;

    // Atualizar Tempo
    gameMinute += delta * timeSpeedFactor * 60;
    if (gameMinute >= 60) {
        const hoursToAdd = Math.floor(gameMinute / 60);
        gameHour = (gameHour + hoursToAdd) % dayDurationHours;
        gameMinute %= 60;
    }

    const displayHour = String(gameHour).padStart(2, '0');
    const displayMinute = String(Math.floor(gameMinute)).padStart(2, '0');
    clockElement.textContent = `Time: ${displayHour}:${displayMinute}`;

    // Atualizar Iluminação baseada no Tempo
    const timeProgress = (gameHour + gameMinute / 60) / dayDurationHours;
    const angle = timeProgress * Math.PI * 2 - Math.PI / 2;

    // Calcular Intensidades usando Onda Senoidal
    const sunIntensityFactor = Math.pow(Math.max(0, (Math.sin(angle) + 1) / 2), 4);
    const moonIntensityFactor = Math.max(0, (Math.sin(angle + Math.PI) + 1) / 2);

    const minAmbient = 0.1;
    const maxAmbient = 0.6;
    const minDirectional = 0.1;
    const maxDirectional = 0.9;

    const currentAmbientIntensity = minAmbient + (maxAmbient - minAmbient) * sunIntensityFactor;
    const currentDirectionalIntensity = minDirectional + (maxDirectional - minDirectional) * Math.pow(sunIntensityFactor, 0.35);

    // Calcular Cores
    const nightSkyColor = new THREE.Color(0x000000);
    const daySkyColor = new THREE.Color(0x87ceeb);

    const nightFogColor = new THREE.Color(0x111111);
    const dayFogColor = new THREE.Color(0xaaaaaa);

    let currentSkyColor = new THREE.Color();
    let currentFogColor = new THREE.Color();

    const colorLerpFactor = Math.pow(sunIntensityFactor, 0.25);
    currentSkyColor.lerpColors(nightSkyColor, daySkyColor, colorLerpFactor);

    currentFogColor.lerpColors(nightFogColor, dayFogColor, colorLerpFactor);

    // Calcular Posição da Luz
    const sunX = 20 * Math.cos(angle);
    const sunY = 25 * Math.max(0, Math.sin(angle));
    const sunZ = -15 * Math.cos(angle);
    directionalLight.position.set(sunX, sunY, sunZ);

    // Aplicar os valores calculados
    scene.background.copy(currentSkyColor);
    if (scene.fog) {
         scene.fog.color.copy(currentFogColor);
    }
    ambientLight.intensity = currentAmbientIntensity;
    directionalLight.intensity = currentDirectionalIntensity;

    // Controlar Visibilidade das Estrelas
    if (starField && starField.children.length > 0) {
        const sharedMaterial = starField.children[0].material;
        if (sharedMaterial) {
            const nightThreshold = 0.2;
            const starOpacity = (sunIntensityFactor < nightThreshold) ? 1.0 : 0.0;
            sharedMaterial.opacity = starOpacity;
        }
    }

    // Controlar Postes de Luz
    const turnOnHour = 17;
    const turnOnMinute = 30;
    const turnOffHour = 6;
    const maxStreetlightIntensity = 1.5;

    const isNightTime = (gameHour > turnOnHour || (gameHour === turnOnHour && gameMinute >= turnOnMinute)) || gameHour < turnOffHour;

    roadSegments.forEach(segment => {
        const lightsToControl = [segment.leftLight, segment.rightLight];
        lightsToControl.forEach(light => {
            if (light) {
                if (isNightTime) {
                    light.visible = true;
                    light.intensity = maxStreetlightIntensity;
                } else {
                    light.intensity = 0;
                    light.visible = false;
                }
            }
        });
    });
}

// Atualização das Luzes do Jogador
function updatePlayerLights() {
    if (!playerCar) return;

    const headlightL = playerCar.getObjectByName("headlightL");
    const headlightR = playerCar.getObjectByName("headlightR");
    const taillightL = playerCar.getObjectByName("taillightL");
    const taillightR = playerCar.getObjectByName("taillightR");
    const spotLightL = playerCar.getObjectByName("spotlightL");
    const spotLightR = playerCar.getObjectByName("spotlightR");

    // Faróis (Material Visual do Mesh)
    const targetHeadlightMat = headlightsOn ? headlightMaterialOn : headlightMaterial;
    if (headlightL && headlightL.material !== targetHeadlightMat) {
        headlightL.material = targetHeadlightMat;
    }
    if (headlightR && headlightR.material !== targetHeadlightMat) {
        headlightR.material = targetHeadlightMat;
    }

    // Faróis (Visibilidade dos Spotlights Reais)
    if (spotLightL) {
        spotLightL.visible = headlightsOn;
    }
    if (spotLightR) {
        spotLightR.visible = headlightsOn;
    }

    // Lanternas Traseiras (Luzes de Freio)
    const isBraking = keysPressed['ArrowDown'] || keysPressed['s'];
    const targetTaillightMat = isBraking ? taillightMaterialOn : taillightMaterial;
    if (taillightL && taillightL.material !== targetTaillightMat) {
        taillightL.material = targetTaillightMat;
    }
    if (taillightR && taillightR.material !== targetTaillightMat) {
        taillightR.material = targetTaillightMat;
    }
}

// Controle da Mira
const crosshair = document.getElementById('crosshair');

function updateCrosshairVisibility() {
    if (crosshair) {
        if (wingPowerTimer > 0) {
            crosshair.style.display = 'block';
            document.body.classList.add('hide-cursor');
        } else {
            crosshair.style.display = 'none';
            document.body.classList.remove('hide-cursor');
        }
    }
}

// Mira Segue o Mouse
function updateCrosshairPosition() {
    if (crosshair && wingPowerTimer > 0) {
        crosshair.style.display = 'block';
        crosshair.style.left = (mouseScreen.x * 100) + '%';
        crosshair.style.top = (mouseScreen.y * 100) + '%';
        crosshair.style.marginLeft = '-20px';
        crosshair.style.marginTop = '-20px';
    }
}

// Sistema de Mísseis
const MAX_MISSILES = 5;
let activeMissiles = [];
let missilesLeft = 0;
let mouseScreen = { x: 0.5, y: 0.5 };

window.addEventListener('mousemove', (e) => {
    mouseScreen.x = e.clientX / window.innerWidth;
    mouseScreen.y = e.clientY / window.innerHeight;
});

window.addEventListener('mousedown', (e) => {
    if (wingPowerTimer > 0 && missilesLeft > 0 && !isPaused && !isGameOver) {
        launchMissile();
        missilesLeft--;
    }
});

// Lançar Míssil
function launchMissile() {
    const vector = new THREE.Vector3(
        (mouseScreen.x * 2 - 1),
        -(mouseScreen.y * 2 - 1),
        0.5
    );
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const missileStart = playerCar.position.clone().add(new THREE.Vector3(0, 1.5, 2));
    const missile = createMissileMesh(missileStart, dir);
    scene.add(missile.mesh);
    activeMissiles.push(missile);
}

// Criar Mesh do Míssil
function createMissileMesh(start, direction) {
    const geometry = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(start);
    mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize()
    );
    mesh.castShadow = true;
    const trailLength = 18;
    const trailGeometry = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(trailLength * 3);
    for (let i = 0; i < trailLength; i++) {
        trailPositions[i * 3 + 0] = mesh.position.x;
        trailPositions[i * 3 + 1] = mesh.position.y;
        trailPositions[i * 3 + 2] = mesh.position.z;
    }
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMaterial = new THREE.LineBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0.7 });
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    mesh.add(trail);
    return {
        mesh,
        direction,
        speed: 2.5,
        life: 2.5,
        trail,
        trailPositions,
        trailLength
    };
}

// Atualizar Mísseis
function updateMissiles(delta) {
    for (let i = activeMissiles.length - 1; i >= 0; i--) {
        const missile = activeMissiles[i];
        missile.mesh.position.add(missile.direction.clone().multiplyScalar(missile.speed));
        missile.life -= delta;
        if (missile.trail && missile.trailPositions) {
            for (let j = missile.trailLength - 1; j > 0; j--) {
                missile.trailPositions[j * 3 + 0] = missile.trailPositions[(j - 1) * 3 + 0];
                missile.trailPositions[j * 3 + 1] = missile.trailPositions[(j - 1) * 3 + 1];
                missile.trailPositions[j * 3 + 2] = missile.trailPositions[(j - 1) * 3 + 2];
            }
            missile.trailPositions[0] = missile.mesh.position.x;
            missile.trailPositions[1] = missile.mesh.position.y;
            missile.trailPositions[2] = missile.mesh.position.z;
            missile.trail.geometry.attributes.position.needsUpdate = true;
        }
        for (let j = obstacles.length - 1; j >= 0; j--) {
            const collider = obstacleColliders[j];
            if (collider && collider.containsPoint(missile.mesh.position)) {
                showExplosion(obstacles[j].position.clone());
                removeObstacle(j);
                scene.remove(missile.mesh);
                activeMissiles.splice(i, 1);
                break;
            }
        }
        if (missile.life <= 0 && activeMissiles.includes(missile)) {
            scene.remove(missile.mesh);
            activeMissiles.splice(i, 1);
        }
    }
}

// Mostrar Explosão Simples
function showExplosion(position) {
    const group = new THREE.Group();
    for (let i = 0; i < 18; i++) {
        const geo = new THREE.SphereGeometry(0.18 + Math.random()*0.12, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color: i%2===0 ? 0xffe066 : 0xff3300 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(position);
        const angle = (i / 18) * Math.PI * 2;
        const speed = 1.2 + Math.random()*0.7;
        mesh.userData = {
            vx: Math.cos(angle) * speed,
            vy: (Math.random()-0.5)*1.2,
            vz: Math.sin(angle) * speed
        };
        group.add(mesh);
    }
    scene.add(group);
    let t = 0;
    function animateExplosion() {
        t += 0.04;
        group.children.forEach(p => {
            p.position.x += p.userData.vx * (1-t) * 0.18;
            p.position.y += p.userData.vy * (1-t) * 0.18;
            p.position.z += p.userData.vz * (1-t) * 0.18;
            p.material.opacity = Math.max(0, 1-t*1.2);
            p.material.transparent = true;
            p.scale.setScalar(1 + t*1.7);
        });
        if (t < 1.1) {
            requestAnimationFrame(animateExplosion);
        } else {
            scene.remove(group);
        }
    }
    animateExplosion();
}

// Remover Obstáculo
function removeObstacle(index) {
    const group = obstacles[index];
    while (group.children.length > 0) {
        const child = group.children[0];
        group.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
            else child.material.dispose();
        }
    }
    scene.remove(group);
    obstacles.splice(index, 1);
    obstacleColliders.splice(index, 1);
}

// Iniciar o jogo
init();
