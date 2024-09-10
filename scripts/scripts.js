import * as THREE from "../node_modules/three/build/three.module.js";
import { VRButton } from '../node_modules/three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from '../node_modules/three/examples/jsm/webxr/XRControllerModelFactory.js';

// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
// import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/webxr/VRButton.js';
// import * as PANOLENS from 'https://cdn.jsdelivr.net/npm/panolens@0.12.1/build/panolens.module.js';
// import * as PANOLENS from '/node_modules/panolens/build/panolens.module.js';


let camera;
let renderer;
let scene;
init();
function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local');
	// Setting up VR support
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));

    // Scene and camera setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.layers.enable(1);

    // Load the equirectangular panoramic texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('assets/island.png', (texture) => {
        // Convert equirectangular to cubemap
        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(texture.image.height);
        cubeRenderTarget.fromEquirectangularTexture(renderer, texture);
        // Set the scene's background to the cube map
        scene.background = cubeRenderTarget.texture;
    });

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
	const intersectedObjects = []; // Array of objects to intersect with

	// Add objects to scene and intersectedObjects array
	const box = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
	box.position.set(0, 1.5, -2);
	scene.add(box);
	intersectedObjects.push(box);

	// Grip action function
	function gripAction() {
	    console.log('Grip button pressed');
	}

	// Handle grip button event
	controller.addEventListener('selectstart', gripAction);

    // Resize event listener
    window.addEventListener('resize', onWindowResize);
}


function getTexturesFromAtlasFile( atlasImgUrl, tilesNum ) {
	const textures = [];
	for ( let i = 0; i < tilesNum; i ++ ) {
		textures[ i ] = new THREE.Texture();
	}
	const loader = new THREE.ImageLoader();
	loader.load( atlasImgUrl, function ( imageObj ) {
		let canvas, context;
		const tileWidth = imageObj.height;
		for ( let i = 0; i < textures.length; i ++ ) {
			canvas = document.createElement( 'canvas' );
			context = canvas.getContext( '2d' );
			canvas.height = tileWidth;
			canvas.width = tileWidth;
			context.drawImage( imageObj, tileWidth * i, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth );
			textures[ i ].colorSpace = THREE.SRGBColorSpace;
			textures[ i ].image = canvas;
			textures[ i ].needsUpdate = true;
		}
	} );
	return textures;
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {
	// renderer.render( scene, camera );
	renderer.render(render);
}

// const panoramaImage = 'assets/1.JPG';
// var panorama = new PANOLENS.ImagePanorama(panoramaImage);

// const container = document.querySelector('.container');

// var viewer = new PANOLENS.Viewer({
//     container: container,
//     autoHideInfospot: false,
//     controlBar: true,
//     // camera: camera
// });

// viewer.add( panorama );
UpdateVRButtonStyle();
function UpdateVRButtonStyle(){
	const vrButton = document.getElementById('VRButton');
	vrButton.style.bottom = '120px';
	vrButton.style.right = '20px';
}

function render() {
    // Update raycaster from the controller position and direction
    raycaster.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(controller.matrixWorld);

    // Check intersections
    const intersects = raycaster.intersectObjects(intersectedObjects);

    if (intersects.length > 0) {
        ray.material.color.set(0xff0000); // Change ray color to red when intersecting
    } else {
        ray.material.color.set(0x0000ff); // Change ray color to blue otherwise
    }

    renderer.render(scene, camera);
}