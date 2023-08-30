import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';

import {
	Carousel,
    Lightbox,
    initTE,
} from "tw-elements";

// initTE({ Lightbox });
// initTE({ Carousel });

const manager = new THREE.LoadingManager(() => {

});

manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

manager.onLoad = function ( ) {
	console.log( 'Loading complete!');
	const loadingScreen = document.getElementById( 'loading-screen' );
	setTimeout(() => {
		loadingScreen.classList.add( 'fade-out' );
	}, 1000);
	
	// optional: remove loader from DOM via event listener
	// loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
};

manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

manager.onError = function ( url ) {
	console.log( 'There was an error loading ' + url );
};

const mtlloader = new MTLLoader(manager);
const fontloader = new FontLoader(manager);

const DEBUG = false;
const EDGE_HEIGHT = -1;
const CAMERA_HEIGHT = 4.14;

// const TEXT = "STRAWBERRY";
const TYPEFACE_PATH = "./assets/fonts/Bebas Neue_Regular.typeface.json";
const MTL_PATH = "./assets/models/Strawberry/Strawberry.mtl";
const OBJ_PATH = "./assets/models/Strawberry/Strawberry.obj";
const BLOOM_PARAMS = {
	threshold: 0,
	strength: 0.1,
	radius: 0.1,
	exposure: 0.05
};
const SPHERE_SIZE = 0.1;
const SPHERE_COUNT = 800;
const SPHERE_BORDERS = {
	MIN_X: -50,
	MAX_X: 50,
	MIN_Y: 0 - EDGE_HEIGHT + SPHERE_SIZE + 50,
	MAX_Y: 80,
	MIN_Z: -50,
	MAX_Z: 0
};

let aspectRatio, controls, verticalMirror, scene, camera, renderer, finalComposer, bloomComposer, spheres = [];

init();
animate();

function init() {

	aspectRatio = window.innerWidth / window.innerHeight;
	let HEADER = {
		TEXT: "STRAWBERRY",
		size: 8,
		height: 0,
		x: -36,
		z: -50,
		y: -EDGE_HEIGHT,
	};
	let OBJECTS = [
		{
			enabled: true,
			rotation_x: 1.1,
			rotation_y: 0,
			rotation_z: -0.4,
			position_x: 6.2,
			position_y: -EDGE_HEIGHT + 2.38,
			position_z: -13,
			scale: 1
		}, {
			enabled: true,
			rotation_x: -1.1,
			rotation_y: -2.6,
			rotation_z: -1.8,
			position_x: 24.5,
			position_y: -EDGE_HEIGHT + 1.73,
			position_z: -35,
			scale: 0.7
		}, {
			enabled: true,
			rotation_x: -1.1,
			rotation_y: -2.6,
			rotation_z: -1.8,
			position_x: -21.9,
			position_y: -EDGE_HEIGHT + 1.62,
			position_z: -35,
			scale: 0.7
		}
	];
	
	let OBJECT_ROTATING = {
		enabled: true,
		scale: 0.1
	};

	if (aspectRatio > 1.44) {
		// DESKTOP
		HEADER.TEXT = "STRAWBERRY";
	} else if (aspectRatio <= 0.5) {
		// MOBILE
		HEADER.TEXT = "STRAW\n BERRY";
		HEADER.x = -10;
		HEADER.y = -EDGE_HEIGHT + 6;
		HEADER.size = 6;
		OBJECTS[0].position_x = 0;
		OBJECTS[0].position_y = -EDGE_HEIGHT + 1.18;
		OBJECTS[0].position_z = -4;
		OBJECTS[0].scale = 0.5;
		OBJECTS.pop();
		OBJECTS.pop();
	} else if (aspectRatio <= 1.44) {
		// tablet
		HEADER.TEXT = "STRAW\n BERRY";
		HEADER.x = -14;
		HEADER.y = -EDGE_HEIGHT + 8;
		OBJECTS[0].position_x = 1.8;
		OBJECTS[0].position_y = -EDGE_HEIGHT + 1.21;
		OBJECTS[0].position_z = -4;
		OBJECTS[0].scale = 0.5;
		OBJECTS.pop();
		OBJECTS.pop();
	}
	console.log(aspectRatio);

	// SCENE
	scene = new THREE.Scene();
	
	// CAMERA
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.z = 10;
	camera.position.y = CAMERA_HEIGHT;
	camera.position.x = 0;
	
	// RENDERER
	renderer = new THREE.WebGLRenderer( {antialias:true, alpha: true} );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	// renderer.setClearColor( 0x000000, 0 ); // the default
	document.getElementById("focus-element").appendChild( renderer.domElement );

	if (DEBUG) {
		controls = new OrbitControls(camera, renderer.domElement);
		controls.update();
	}

	// FLAT PLANE
	const flatPlaneMaterial = new THREE.MeshStandardMaterial({color:0xd14495, opacity: 0.9, transparent: true})
	const flatPlaneGeometry = new THREE.PlaneGeometry(3000, 5000);
	const flatPlane = new THREE.Mesh(flatPlaneGeometry, flatPlaneMaterial);
	flatPlane.castShadow = false;
	flatPlane.receiveShadow = true;
	flatPlane.rotation.x = -Math.PI / 2;
	flatPlane.position.y = -EDGE_HEIGHT + 0.001;
	flatPlane.position.z = -2500;
	scene.add(flatPlane);


	const underPlaneMaterial = new THREE.MeshBasicMaterial({ opacity: 0, transparent: true})
	const underPlane = new THREE.Mesh(flatPlaneGeometry, underPlaneMaterial);
	underPlane.rotation.x = Math.PI / 2;
	underPlane.position.y = -EDGE_HEIGHT - 1;
	underPlane.position.z = -2500;
	scene.add(underPlane);

	const backgroundPlaneGeometry = new THREE.PlaneGeometry(500, 500);
	const backgroundPlaneMaterial = new THREE.MeshBasicMaterial({color:0xd14495})
	const backgroundPlane = new THREE.Mesh(backgroundPlaneGeometry, backgroundPlaneMaterial);
	backgroundPlane.position.y = -EDGE_HEIGHT - (500 / 2);
	backgroundPlane.position.z = -5;
	// scene.add(backgroundPlane);

	// MIRROR
	const mirrorPlaneGeometry = new THREE.PlaneGeometry(300, 50);
	verticalMirror = new Reflector( mirrorPlaneGeometry, {
		clipBias: 0.003,
		textureWidth: window.innerWidth * window.devicePixelRatio,
		textureHeight: window.innerHeight * window.devicePixelRatio,
		color: 0xc1cbcb,
	} );
	verticalMirror.rotation.x = -Math.PI / 2;
	verticalMirror.position.y = -EDGE_HEIGHT;
	verticalMirror.position.z = -25;
	scene.add( verticalMirror );

	// WALL PLANE
	const wallPlaneGeometry = new THREE.PlaneGeometry(300, 2);
	const wallPlaneMaterial = new THREE.MeshBasicMaterial({color:0xffffff})
	const wallPlane = new THREE.Mesh(wallPlaneGeometry, wallPlaneMaterial);
	wallPlane.position.y = -EDGE_HEIGHT - (2 / 2);
	wallPlane.position.z = 0;
	scene.add(wallPlane);

	// FLOATING SPHERES
	for (let i = 0; i < SPHERE_COUNT; i++) {
		const geometry = new THREE.SphereGeometry( SPHERE_SIZE, 32, 32 );
		const material = new THREE.MeshBasicMaterial( {color: 0xffffff, transparent: true} );
		const sphere = new THREE.Mesh( geometry, material );
		sphere.position.x = Math.random() * (Math.abs(SPHERE_BORDERS.MAX_X) + Math.abs(SPHERE_BORDERS.MIN_X)) - ((Math.abs(SPHERE_BORDERS.MAX_X) + Math.abs(SPHERE_BORDERS.MIN_X)) / 2);
		sphere.position.y = Math.random() * (Math.abs(SPHERE_BORDERS.MAX_Y) + Math.abs(SPHERE_BORDERS.MIN_Y)) - Math.abs(SPHERE_BORDERS.MIN_Y);
		sphere.position.z = Math.random() * (Math.abs(SPHERE_BORDERS.MAX_Z) + Math.abs(SPHERE_BORDERS.MIN_Z)) - Math.abs(SPHERE_BORDERS.MIN_Z);
		scene.add( sphere );

		// ADD SPHERE TO ARRAY AND SET A RANDOM VECTOR
		spheres.push({
			mesh: sphere,
			vector: new THREE.Vector3(
				Math.random() * 1 - 0.5, // x
				Math.random() * 1 - 0.5, // y
				Math.random() * 1 - 0.5  // z
			)
		});
	}
	

	// BLOOM EFFECT
	const hemiLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 3 );
	scene.add(hemiLight);

	const renderScene = new RenderPass( scene, camera );

	const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
	bloomPass.threshold = BLOOM_PARAMS.threshold;
	bloomPass.strength = BLOOM_PARAMS.strength;
	bloomPass.radius = BLOOM_PARAMS.radius;

	bloomComposer = new EffectComposer( renderer );
	bloomComposer.renderToScreen = false;
	bloomComposer.addPass( renderScene );
	bloomComposer.addPass( bloomPass );

	const mixPass = new ShaderPass(
		new THREE.ShaderMaterial( {
			uniforms: {
				baseTexture: { value: null },
				bloomTexture: { value: bloomComposer.renderTarget2.texture }
			},
			vertexShader: document.getElementById( 'vertexshader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
			defines: {}
		} ), 'baseTexture'
	);
	mixPass.needsSwap = true;

	const outputPass = new OutputPass();

	finalComposer = new EffectComposer( renderer );
	finalComposer.addPass( renderScene );
	finalComposer.addPass( mixPass );
	finalComposer.addPass( outputPass );

	const fontPromise = new Promise((resolve, reject) => {
		fontloader.load(TYPEFACE_PATH, function ( font ) {
			resolve(font);
		} );
	});

	const modelPromise = new Promise((resolve, reject) => {
		mtlloader.load(MTL_PATH, function(materials) {
			materials.preload();
			const objloader = new OBJLoader();
			objloader.setMaterials(materials);
			objloader.load(OBJ_PATH, function(object) {
				resolve(object);
			});
		});
	});

	Promise.all([fontPromise, modelPromise]).then((values) => {
		const font = values[0];
		const object = values[1];

		// TEXT
		const geometry = new TextGeometry(HEADER.TEXT, {
			font: font,
			size: HEADER.size,
			height: HEADER.height,
			curveSegments: 20
		});
		const textMaterial = new THREE.MeshStandardMaterial({color:0xFFFFFF, opacity: 0.8999, transparent: true})
		const text = new THREE.Mesh( geometry, textMaterial );
		text.position.x = HEADER.x;
		text.position.z = HEADER.z;
		text.position.y = HEADER.y;
		scene.add( text );

		// MAIN OBJECT
		OBJECTS.forEach((data, i) => {
			if (OBJECTS[i].enabled) {
				let newObject = object;
				if (i > 0) {
					newObject = object.clone();
				}

				newObject.traverse( function( child ) { 

					if ( child.isMesh ) {
				
						child.castShadow = true;
						child.receiveShadow = true;
						child.material.transparent = true;
				
					}
				
				} );
				
				newObject.castShadow = true;
				newObject.rotation.x = data.rotation_x;
				newObject.rotation.y = data.rotation_y;
				newObject.rotation.z = data.rotation_z;
				newObject.position.x = data.position_x;
				newObject.position.y = data.position_y;
				newObject.position.z = data.position_z;
				newObject.scale.x = data.scale;
				newObject.scale.y = data.scale;
				newObject.scale.z = data.scale;
				data.mesh = newObject;
				scene.add( newObject );
			}
		});

		if (OBJECT_ROTATING.enabled) {
			let newObject = object.clone();
			OBJECT_ROTATING.mesh = newObject;
			newObject.rotation.x = 0;
			newObject.rotation.y = 0;
			newObject.rotation.z = 0;
			newObject.position.x = 0;
			newObject.position.y = 0.5;
			newObject.position.z = -1;
			newObject.scale.x = OBJECT_ROTATING.scale;
			newObject.scale.y = OBJECT_ROTATING.scale;
			newObject.scale.z = OBJECT_ROTATING.scale;

			newObject.children.forEach(child => {
				child.geometry.center();
			});
			console.log(newObject)
			// newObject.center();
			// var box = new THREE.Box3().setFromObject( newObject );
			// box.getCenter( newObject.position ); // this re-sets the mesh position
			// // newObject.position.multiplyScalar( - 1 );

			// var pivot = new THREE.Group();
			// scene.add( pivot );
			// pivot.add( newObject );
			// OBJECT_ROTATING.pivot = pivot;
			// newObject.translateY(-110);


			scene.add( newObject );
		}
		

		// AMBIENT LIGHT
		const alight = new THREE.AmbientLight( 0xffffff, 0.3 ); // soft white light
		scene.add( alight );

		// DIRECTIONAL LIGHT
		let light = new THREE.DirectionalLight(0xFFFFEE, 5.0);
		light.position.set(15, 10, 2);
		// light.shadow.mapSize.width = 1024;
		// light.shadow.mapSize.height = 1024;
		// light.shadow.camera.top = 150;
		// light.shadow.camera.right = 150;
		// light.shadow.camera.left = 150;
		// light.shadow.camera.bottom = 100;
		// light.shadow.radius = 450;
		// light.shadow.blurSamples = 250;
		if (DEBUG) {
			const helper = new THREE.CameraHelper( light.shadow.camera );
			scene.add( helper );
		}
		scene.add(light);
		
	});

	// EVENT LISTENERS FOR USER ACTIONS
	if (!DEBUG) {
		window.addEventListener("scroll", (event) => {
			let scrollIndex = window.scrollY / window.innerHeight;
			const cameraNewPosition = CAMERA_HEIGHT - (scrollIndex * 4.14 * 2); 
			camera.position.y = cameraNewPosition;
			if (OBJECT_ROTATING.enabled && OBJECT_ROTATING.mesh) {
				// OBJECT_ROTATING.mesh.rotation.x = scrollIndex * 2 * Math.PI;
				OBJECT_ROTATING.mesh.rotation.y = scrollIndex * 2 * Math.PI;
				OBJECT_ROTATING.mesh.rotation.z = scrollIndex * 2 * Math.PI;
				if (cameraNewPosition < 0.5) {
					OBJECT_ROTATING.mesh.position.y = cameraNewPosition;
				}

			}

			renderer.render( scene, camera );
		});

		// window.addEventListener('mousemove', (event) => {
		// 	const lookIndexX = (event.clientX * 2 / window.innerWidth) - 1;
		// 	// camera.position.x = (lookIndexX * 0.05);
		// 	// renderer.render( scene, camera );
		// 	// camera.lookAt(OBJECT_ROTATING.mesh.position.x, OBJECT_ROTATING.mesh.position.y, OBJECT_ROTATING.mesh.position.z);

		// 	spheres.forEach(sphere => {
		// 		sphere.vector.x = sphere.vector.x + (lookIndexX * 0.0001);;
		// 	});
		// });

	}

	window.addEventListener( 'resize', onWindowResize );
}

function animate() {
    requestAnimationFrame( animate );
	render();	
	update();
}

function update() {
	// For each sphere update vector
	spheres.forEach(sphere => {
		sphere.mesh.position.add(sphere.vector);
		// Spheres slowly changing vector
		sphere.vector.x = sphere.vector.x + Math.random() * 0.0001 - 0.00005;
		sphere.vector.y = sphere.vector.y + Math.random() * 0.0001 - 0.00005;
		sphere.vector.z = sphere.vector.z + Math.random() * 0.0001 - 0.00005;

		// Teleport sphere if out of bounds
		if (sphere.mesh.position.x > SPHERE_BORDERS.MAX_X) {
			sphere.mesh.position.x = SPHERE_BORDERS.MIN_X;
		}
		if (sphere.mesh.position.x < SPHERE_BORDERS.MIN_X) {
			sphere.mesh.position.x = SPHERE_BORDERS.MAX_X;
		}
		if (sphere.mesh.position.z > SPHERE_BORDERS.MAX_Z) {
			sphere.vector.z = sphere.vector.z * -1;
		}
		if (sphere.mesh.position.z < SPHERE_BORDERS.MIN_Z) {
			sphere.vector.z = sphere.vector.z * -1;
		}
		
		// Bounce off edges
		if (sphere.mesh.position.y > SPHERE_BORDERS.MAX_Y) {
			sphere.vector.y = sphere.vector.y * -1;
		}
		if (sphere.mesh.position.y < SPHERE_BORDERS.MIN_Y) {
			sphere.vector.y = sphere.vector.y * -1;
		}

		// Set max speed of spheres
		if (sphere.vector.length() > 0.01) {
			sphere.vector.normalize();
			sphere.vector.multiplyScalar(0.01);
		}

	});
	if (DEBUG) {
		controls.update();
	}
}

function render() {
	bloomComposer.render();
	finalComposer.render();
}

function onWindowResize() {
	
	camera.aspect = window.innerWidth / window.innerHeight;
	aspectRatio = window.innerWidth / window.innerHeight;
	console.log(aspectRatio);

	console.log(window);
	renderer.setSize( window.innerWidth, window.innerHeight );
	camera.updateProjectionMatrix();

	verticalMirror.getRenderTarget().setSize(
		window.innerWidth * window.devicePixelRatio,
		window.innerHeight * window.devicePixelRatio
	);
}