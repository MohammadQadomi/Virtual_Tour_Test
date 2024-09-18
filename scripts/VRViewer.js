// import * as THREE from "../node_modules/three/build/three.module.js";
// import { VRButton } from '../node_modules/three/examples/jsm/webxr/VRButton.js';
import * as THREE from "./three.module.js";
import { VRButton } from './VRButton.js';
import { XRControllerModelFactory } from './XRControllerModelFactory.js';

import {Location, Arrow, Hotspot, ImageStorage} from "./Location.js";

// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
// import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/webxr/VRButton.js';
// import * as PANOLENS from 'https://cdn.jsdelivr.net/npm/panolens@0.12.1/build/panolens.module.js';
// import * as PANOLENS from '/node_modules/panolens/build/panolens.module.js';



let intersects;
let intersectedObject;
let VRNavigationElements = [];

function Start(){
// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 5000);
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
directionalLight.position.set(5, 10, 7.5); // Position the light
// directionalLight.castShadow = true; // Enable shadows
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




function InitialLocation(){
	let tempArrow = new Arrow('', 'assets/arrow_3.png', 'مبنى ادارة جوال', new THREE.Vector3(3900, 488, -960), 0, 200, '', 'test destination', '#ffffff' );

	let arrows = [tempArrow];
	VRNewLocation('assets/Blank.png', arrows);
}
InitialLocation();

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

function CreatePlaneTexture(camera, imagePath, position, scale, rotation ,destination){
	const planeGeometry = new THREE.PlaneGeometry(scale, scale);
	const planeTexture = new THREE.TextureLoader().load(imagePath);
	const planeMaterial = new THREE.MeshBasicMaterial({ map: planeTexture, transparent: true });
	const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
	planeMesh.userData = {
		type: 'arrow',
		destinationId: destination
	};
	planeMesh.position.set(position.x, position.y, position.z); // Set plane position
	planeMesh.lookAt(camera.position);
	scene.add(planeMesh);

	intersectedObjects.push(planeMesh);
	return planeMesh;
}

function CreateHoverText(text, position, color = 'white'){
	// Create a canvas for the text
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	canvas.width = 512;
	canvas.height = 128;
	context.font = '20px Neo Sans';
	context.fillStyle = color;
	context.textAlign = 'center';
	context.fillText(text , canvas.width / 2, canvas.height / 2);

	// Create texture from canvas
	const textTexture = new THREE.CanvasTexture(canvas);
	const textMaterial = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });
	const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(1500 * 2, 375 * 2), textMaterial); // Scale text plane
	textPlane.position.set(position.x, position.y + 250 ,position.z); // Position the text above the plane mesh
	textPlane.lookAt(camera.position);
	scene.add(textPlane);

	return textPlane;
}

function VRCreateArrow(camera, arrow){
	VRNavigationElements.push(CreateHoverText(arrow.title, arrow.position));
	VRNavigationElements.push(CreatePlaneTexture(camera, arrow.imagePath, arrow.position, arrow.scale, arrow.rotation, arrow.destination));
}

// Grip action function
function triggerAction() {
    console.log('Trigger button pressed');
	if(intersectedObject !== null){
		if (intersectedObject.userData.type === "arrow") {
			console.log('The intersected object is an Arrow.');
			console.log(`arrow destination: ${intersectedObject.userData.destinationId}`);

			VRNewLocation("assets/island.png"); // For testing
		}
		else if (intersectedObject.userData.type === "hotspot") {
			console.log('The intersected object is a hotspot.');
			console.log(`hotspot description: ${intersectedObject.userData.destinationId}`);
		}
		else {
			console.log('The intersected object is not a navigation element!');
		}
	}
}

function VRNewLocation(imagePath, arrows = null){
	// Change scene image
	SetSkyboxImage(imagePath);

	// Clear navigation elements
	for(let i = 0; i < VRNavigationElements.length; i++){
		scene.remove(VRNavigationElements[i]);
	}
	VRNavigationElements = [];

	// Create scene arrows
	if(arrows !== null){
		for(let i = 0; i < arrows.length; i++){
			VRCreateArrow(camera, arrows[i]);
		}
	}
}

// Handle trigger button event
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
    raycaster.ray.direction.set(0, 0, -10000).applyMatrix4(tempMatrix);

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
}

export {Start};