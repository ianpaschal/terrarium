// Single imports make it easier to swap out a three component for our own
import {
	BoxBufferGeometry,
	Color,
	Float32BufferAttribute,
	Fog,
	Mesh,
	MeshBasicMaterial,
	MeshPhongMaterial,
	PerspectiveCamera,
	PlaneBufferGeometry,
	Raycaster,
	Scene,
	Vector3,
	VertexColors,
	WebGLRenderer
} from "three";
import DaylightSystem from "./world/DaylightSystem";
import PointerLockControls from "./PointerLockControls";
let camera;
const scene = new Scene();
scene.background = new Color( 0xffffff );
scene.fog = new Fog( 0xffffff, 0, 750 );
scene.add( new DaylightSystem() );
let renderer;
let controls;
const player = {
	position: new Vector3(),
	raycasters: {
		left: new Raycaster( new Vector3(), new Vector3( -1, 0, 0 ), 0, 5 ),
		right: new Raycaster( new Vector3(), new Vector3( 1, 0, 0 ), 0, 5 ),
		top: new Raycaster( new Vector3(), new Vector3( 0, 1, 0 ), 0, 10 ),
		bottom: new Raycaster( new Vector3(), new Vector3( 0, -1, 0 ), 0, 10 ),
		front: new Raycaster( new Vector3(), new Vector3( 0, 0, 1 ), 0, 2 ),
		back: new Raycaster( new Vector3(), new Vector3( 0, 0, -1 ), 0, 2 )
	}
};
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let prevTime = performance.now();
const objects = [];
const velocity = new Vector3();
const direction = new Vector3();
const vertex = new Vector3();
const color = new Color();
const blocker = document.getElementById( "blocker" );
const keyboardHandlers = {

	// Escape
	27: {
		down() {
			if ( !controls.enabled ) {
				controls.enabled = true;
				blocker.style.display = "none";
				document.body.requestPointerLock();
			} else {
				controls.enabled = false;
				blocker.style.display = "";
				document.exitPointerLock();
			}
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
	if ( keyboardHandlers[ e.keyCode ] ) {
		if ( e.type === "keydown" ) {
			keyboardHandlers[ e.keyCode ].down();
		}
		if ( e.type === "keyup" ) {
			keyboardHandlers[ e.keyCode ].up();
		}
	}
};

const pointerlockchange = function() {
	if ( document.pointerLockElement === document.body ) {
		controls.enabled = true;
		blocker.style.display = "none";
	} else {
		controls.enabled = false;
		blocker.style.display = "block";
	}
};

// Hook pointer lock state change events

function init() {
	camera = new PerspectiveCamera(
		75, window.innerWidth / window.innerHeight, 1, 1000 );
	controls = new PointerLockControls( camera );
	scene.add( controls.getObject() );

	document.addEventListener( "keydown", handleKeyboard, false );
	document.addEventListener( "keyup", handleKeyboard, false );
	document.addEventListener( "pointerlockchange", pointerlockchange, false );

	buildWorld();

	renderer = new WebGLRenderer({
		antialias: false
	});
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

	// Move to player
	if ( controls.enabled ) {
		const time = performance.now();
		const delta = ( time - prevTime ) / 1000;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;
		velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass <- makes no sense

		direction.z = Number( moveForward ) - Number( moveBackward );
		direction.x = Number( moveLeft ) - Number( moveRight );
		direction.normalize(); // this ensures consistent movements in all directions
		// Without it, we move faster diagonally by more than 40%

		// Magic numbers here.
		if ( moveForward || moveBackward ) velocity.z -= direction.z * 400 * delta;
		if ( moveLeft || moveRight ) velocity.x -= direction.x * 400 * delta;

		collisionDetection( player );

		controls.getObject().translateX( velocity.x * delta );
		controls.getObject().translateY( velocity.y * delta );
		controls.getObject().translateZ( velocity.z * delta );
		player.position.copy( controls.getObject() );

		// Hard floor
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
	let floorGeometry = new PlaneBufferGeometry( 2000, 2000, 100, 100 );
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
	floorGeometry.addAttribute( "color", new Float32BufferAttribute( colors, 3 ) );
	const floorMaterial = new MeshBasicMaterial({
		vertexColors: VertexColors
	});
	const floor = new Mesh( floorGeometry, floorMaterial );
	scene.add( floor );
	// objects
	let boxGeometry = new BoxBufferGeometry( 20, 20, 20 );
	boxGeometry = boxGeometry.toNonIndexed(); // ensure each face has unique vertices
	position = boxGeometry.attributes.position;
	colors = [];
	for ( var i = 0, l = position.count; i < l; i ++ ) {
		color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		colors.push( color.r, color.g, color.b );
	}
	boxGeometry.addAttribute( "color", new Float32BufferAttribute( colors, 3 ) );
	for ( var i = 0; i < 500; i ++ ) {
		const boxMaterial = new MeshPhongMaterial({
			specular: 0xffffff,
			flatShading: true,
			vertexColors: VertexColors
		});
		boxMaterial.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		const box = new Mesh( boxGeometry, boxMaterial );
		box.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
		box.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
		box.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;
		scene.add( box );
		objects.push( box );
	}
}

function collisionDetection( player ) {

	for ( const side in player.raycasters ) {
		if ( player.raycasters.hasOwnProperty( side ) ) {
			player.raycasters[ side ].ray.origin.copy( controls.getObject().position );
		}
	}

	/*
		NOTE: This part is a little bit verbose but leaves it easier to use a
		different collision method in the future.
	*/

	function hasCollisions( raycaster ) {
		return raycaster.intersectObjects( objects ).length > 0;
	}

	// If touching on the left (-X) side, force X velocity to be >= 0
	if ( hasCollisions( player.raycasters.left ) ) {
		velocity.x = Math.max( 0, velocity.x );
	}

	// If touching on the right (+X) side, force X velocity to be <= 0
	if ( hasCollisions( player.raycasters.right ) ) {
		velocity.x = Math.min( 0, velocity.x );
	}

	// TODO: Switch y and z

	// If touching on the back (-Z) side, force Z velocity to be >= 0
	if ( hasCollisions( player.raycasters.back ) ) {
		velocity.z = Math.max( 0, velocity.z );
	}

	// If touching on the front (+Z) side, force Z velocity to be <= 0
	if ( hasCollisions( player.raycasters.front ) ) {
		velocity.z = Math.min( 0, velocity.z );
	}

	// If touching on the bottom (-Y) side, force Y velocity to be >= 0
	if ( hasCollisions( player.raycasters.bottom ) ) {
		velocity.y = Math.max( 0, velocity.y );
		canJump = true;
	}

	// If touching on the top (+Y) side, force Y velocity to be <= 0
	if ( hasCollisions( player.raycasters.top ) ) {
		velocity.y = Math.min( 0, velocity.y );
	}

}

init();
animate();
