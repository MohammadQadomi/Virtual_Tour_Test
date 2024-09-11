import * as THREE from "../node_modules/three/build/three.module.js";
import { VRButton } from '../node_modules/three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from './XRControllerModelFactory.js';

// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
// import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/webxr/VRButton.js';
// import * as PANOLENS from 'https://cdn.jsdelivr.net/npm/panolens@0.12.1/build/panolens.module.js';
// import * as PANOLENS from '/node_modules/panolens/build/panolens.module.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.layers.enable(1);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// Setup XR support
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Controller setup
const controller = renderer.xr.getController(0);
scene.add(controller);

const controllerGrip = renderer.xr.getControllerGrip(0);
const controllerModelFactory = new XRControllerModelFactory();
controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip));
scene.add(controllerGrip);

// Ray setup
const rayGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
const rayMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
const ray = new THREE.Line(rayGeometry, rayMaterial);
ray.scale.z = 10;
controller.add(ray);

// Raycaster setup
const raycaster = new THREE.Raycaster();
raycaster.camera = camera;
const intersectedObjects = [];

// Add objects to scene and intersectedObjects array
// const box = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
// box.position.set(0, 1.5, -2);
// scene.add(box);
// intersectedObjects.push(box);

// Create a sprite
const spriteMap = new THREE.TextureLoader().load('assets/CircleFilled.png'); // Replace with your sprite image path
const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffffff });
let sprite = new THREE.Sprite(spriteMaterial);
sprite.scale.set(0.5, 0.5, 1); // Adjust the scale to fit your needs
sprite.position.set(0, 1.5, -2); // Set sprite position
scene.add(sprite);
intersectedObjects.push(sprite);

// Panorama image to skybox
SetSkyboxImage('assets/island.png');


function SetSkyboxImage(imagePath){
	const textureLoader = new THREE.TextureLoader();
	textureLoader.load(imagePath, (texture) => {
	    // Convert equirectangular to cubemap
	    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(texture.image.height);
	    cubeRenderTarget.fromEquirectangularTexture(renderer, texture);
	    // Set the scene's background to the cube map
	    scene.background = cubeRenderTarget.texture;
	});
}

// Grip action function
function triggerAction() {
    console.log('Trigger button pressed');
}

// Handle grip button event
controller.addEventListener('selectstart', triggerAction);

// Animation loop
function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    // Set the raycaster's origin and direction from the controller
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);

    // Set raycaster origin at the controller's position
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);

    // Set ray direction
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    // Check intersections
    const intersects = raycaster.intersectObjects(intersectedObjects);

    if (intersects.length > 0) {
        ray.material.color.set(0xff0000); // Change ray color to red when intersecting
		console.log(`object type: ${intersects[0].object}`);
    } else {
        ray.material.color.set(0x0000ff); // Change ray color to blue otherwise
    }

    renderer.render(scene, camera);
}

animate();