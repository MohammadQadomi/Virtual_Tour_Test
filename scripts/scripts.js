// import * as THREE from "../node_modules/three/build/three.module.js";
// import { VRButton } from '../node_modules/three/examples/jsm/webxr/VRButton.js';
import * as THREE from "./three.module.js";
import { VRButton } from './VRButton.js';
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
renderer.xr.setReferenceSpaceType( 'local' );
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Lighting setup
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 7.5); // Position the light to cast shadows
directionalLight.castShadow = true; // Enable shadows if needed
scene.add(directionalLight);

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

let plane = CreatePlaneTexture('assets/arrow_3.png');
let hoverText = CreateHoverText();




SetSkyboxImage('assets/island.png');

// Skybox image (Panorama)
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


function CreateSprite(imagePath){
	const spriteMap = new THREE.TextureLoader().load(imagePath);
	const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffffff });
	let sprite = new THREE.Sprite(spriteMaterial);
	sprite.scale.set(1, 1, 1);
	sprite.position.set(0, 1.5, -10);
	scene.add(sprite);
	intersectedObjects.push(sprite);
	sprite.rotation.set(0, 0, 0);
}

function CreatePlaneTexture(imagePath){
	const planeGeometry = new THREE.PlaneGeometry(1, 1);
	const planeTexture = new THREE.TextureLoader().load(imagePath);
	const planeMaterial = new THREE.MeshBasicMaterial({ map: planeTexture, transparent: true });
	const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
	planeMesh.position.set(0, 1.5, -10); // Set plane position
	scene.add(planeMesh);
	intersectedObjects.push(planeMesh);
	return planeMesh;
}

function CreateHoverText(){
	// Create a canvas for the text
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	canvas.width = 256;
	canvas.height = 64;
	context.font = 'Bold 30px Arial';
	context.fillStyle = 'white';
	context.textAlign = 'center';
	context.fillText('Arrow', canvas.width / 2, canvas.height / 2);

	// Create texture from canvas
	const textTexture = new THREE.CanvasTexture(canvas);
	const textMaterial = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });
	const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.375), textMaterial); // Scale text plane
	textPlane.position.set(0, 2.5, -10); // Position the text above the plane mesh
	scene.add(textPlane);

	return textPlane;
}

let destinationImagePath = 'assets/1.jpg';

// Grip action function
function triggerAction() {
    console.log('Trigger button pressed');
	console.log(`object type: ${intersectedObject}`);

	if(intersectedObject !== null){
		SetSkyboxImage(destinationImagePath);
		scene.remove(plane);
		scene.remove(hoverText);

		if(destinationImagePath === 'assets/1.JPG'){
			destinationImagePath = 'assets/island.png';
		}
		else{
			destinationImagePath = 'assets/1.jpg';
		}
	}
}

// Handle trigger button event
controller.addEventListener('selectstart', triggerAction);

// Animation loop
function animate() {
    renderer.setAnimationLoop(render);
}

let intersects;
let intersectedObject;
function render() {
    // Set the raycaster's origin and direction from the controller
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);

    // Set raycaster origin at the controller's position
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);

    // Set ray direction
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    // Check intersections
    intersects = raycaster.intersectObjects(intersectedObjects);

    if (intersects.length > 0) {
        ray.material.color.set(0xff0000); // Change ray color to red when intersecting
		intersectedObject = intersects[0].object;
    } else {
        ray.material.color.set(0x0000ff); // Change ray color to blue otherwise
		intersectedObject = null;
    }

    renderer.render(scene, camera);
}

animate();