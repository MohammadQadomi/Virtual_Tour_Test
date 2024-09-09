// import * as THREE from "/node_modules/three/build/three.module.js";
// import { VRButton } from '/node_modules/three/examples/jsm/webxr/VRButton.js';

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/webxr/VRButton.js';
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
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));

    // Scene and camera setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.layers.enable(1);

    // Skybox geometry
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    geometry.scale(1, 1, -1); // Invert the geometry on the x-axis so that all of the faces point inward

    // Load the normal image as a texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('assets/island.png');

    // Create materials with the same texture for all faces of the skybox
    const materials = [];
    for (let i = 0; i < 6; i++) {
        materials.push(new THREE.MeshBasicMaterial({ map: texture }));
    }

    // Create the skybox mesh with the materials
    const skyBox = new THREE.Mesh(geometry, materials);
    skyBox.layers.set(1);
    scene.add(skyBox);

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
	renderer.render( scene, camera );
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
