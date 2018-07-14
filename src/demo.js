import * as THREE from "three";
import PointerLockControls from "./PointerLockControls";
let camera;
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );
scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
let renderer;
let controls;
let raycaster;
const controlsEnabled = false;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let prevTime = performance.now();
const objects = [];
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();
const blocker = document.getElementById( "blocker" );
const instructions = document.getElementById( "instructions" );
const keyboardHandlers = {

	// Escape
	27: {
		down() {
			controls.enabled = true;
			blocker.style.display = "visible";
			document.exitPointerLock();
		},
		up() {

		}
	},

	// Space
	32: {
		down() {
			if ( canJump === true ) velocity.y += 350;
			canJump = false;
		},
		up() {

		}
	},

	// A
	65: {
		down() {
			moveLeft = true;
		},
		up() {
			moveLeft = false;
		}
	},

	// D
	68: {
		down() {
			moveRight = true;
			console.log( "working" );
		},
		up() {
			moveRight = false;
		}
	},

	// S
	83: {
		down() {
			moveBackward = true;
		},
		up() {
			moveBackward = false;
		}
	},

	// W
	87: {
		down() {
			moveForward = true;
		},
		up() {
			moveForward = false;
		}
	}
};

function handleKeyboard( e ) {
	console.log( e.which, e.type );
	if ( e.type === "keydown" ) {
		keyboardHandlers[ e.keyCode ].down();
	}
	if ( e.type === "keyup" ) {
		keyboardHandlers[ e.keyCode ].up();
	}
};

const element = document.body;

const pointerlockchange = function() {
	if ( document.pointerLockElement === element ) {
		controls.enabled = true;
		blocker.style.display = "none";
	} else {
		controls.enabled = false;
		blocker.style.display = "block";
		instructions.style.display = "";
	}
};

// Hook pointer lock state change events
document.addEventListener( "pointerlockchange", pointerlockchange, false );
instructions.addEventListener( "click", () => {
	instructions.style.display = "none";
	// Ask the browser to lock the pointer
	element.requestPointerLock = element.requestPointerLock;
	element.requestPointerLock();
}, false );

function init() {
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
	controls = new PointerLockControls( camera );
	scene.add( controls.getObject() );

	const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
	light.position.set( 0.5, 1, 0.75 );
	scene.add( light );

	document.addEventListener( "keydown", handleKeyboard, false );
	document.addEventListener( "keyup", handleKeyboard, false );

	raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

	buildWorld();
	//
	renderer = new THREE.WebGLRenderer({ antialias: false });
	renderer.setPixelRatio( window.devicePixelRatio );
	// renderer.setPixelRatio( 1 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	//
	window.addEventListener( "resize", onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {

	if ( controls.enabled ) {
		raycaster.ray.origin.copy( controls.getObject().position );
		raycaster.ray.origin.y -= 10;
		const intersections = raycaster.intersectObjects( objects );
		const onObject = intersections.length > 0;
		const time = performance.now();
		const delta = ( time - prevTime ) / 1000;
		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;
		velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
		direction.z = Number( moveForward ) - Number( moveBackward );
		direction.x = Number( moveLeft ) - Number( moveRight );
		direction.normalize(); // this ensures consistent movements in all directions
		if ( moveForward || moveBackward ) velocity.z -= direction.z * 400 * delta;
		if ( moveLeft || moveRight ) velocity.x -= direction.x * 400 * delta;
		if ( onObject === true ) {
			velocity.y = Math.max( 0, velocity.y );
			canJump = true;
		}
		controls.getObject().translateX( velocity.x * delta );
		controls.getObject().translateY( velocity.y * delta );
		controls.getObject().translateZ( velocity.z * delta );
		if ( controls.getObject().position.y < 10 ) {
			velocity.y = 0;
			controls.getObject().position.y = 10;
			canJump = true;
		}
		prevTime = time;
	}
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

function buildWorld() {
	// floor
	let floorGeometry = new THREE.PlaneBufferGeometry( 2000, 2000, 100, 100 );
	floorGeometry.rotateX( - Math.PI / 2 );
	// vertex displacement
	let position = floorGeometry.attributes.position;
	for ( var i = 0, l = position.count; i < l; i ++ ) {
		vertex.fromBufferAttribute( position, i );
		vertex.x += Math.random() * 20 - 10;
		vertex.y += Math.random() * 2;
		vertex.z += Math.random() * 20 - 10;
		position.setXYZ( i, vertex.x, vertex.y, vertex.z );
	}
	floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices
	position = floorGeometry.attributes.position;
	let colors = [];
	for ( var i = 0, l = position.count; i < l; i ++ ) {
		color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		colors.push( color.r, color.g, color.b );
	}
	floorGeometry.addAttribute( "color", new THREE.Float32BufferAttribute( colors, 3 ) );
	const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
	const floor = new THREE.Mesh( floorGeometry, floorMaterial );
	scene.add( floor );
	// objects
	let boxGeometry = new THREE.BoxBufferGeometry( 20, 20, 20 );
	boxGeometry = boxGeometry.toNonIndexed(); // ensure each face has unique vertices
	position = boxGeometry.attributes.position;
	colors = [];
	for ( var i = 0, l = position.count; i < l; i ++ ) {
		color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		colors.push( color.r, color.g, color.b );
	}
	boxGeometry.addAttribute( "color", new THREE.Float32BufferAttribute( colors, 3 ) );
	for ( var i = 0; i < 500; i ++ ) {
		const boxMaterial = new THREE.MeshPhongMaterial({ specular: 0xffffff, flatShading: true, vertexColors: THREE.VertexColors });
		boxMaterial.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		const box = new THREE.Mesh( boxGeometry, boxMaterial );
		box.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
		box.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
		box.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;
		scene.add( box );
		objects.push( box );
	}
}

init();
animate();
