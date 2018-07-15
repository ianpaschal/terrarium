// Single imports make it easier to swap out a three component for our own
import {
	Fog,
	PerspectiveCamera,
	Scene,
	WebGLRenderer
} from "three";
import DaylightSystem from "./world/DaylightSystem";
// import PointerLockControls from "./PointerLockControls";
import TestArea from "./world/TestArea";
import Player from "./Player";

let camera;
const scene = new Scene();
scene.fog = new Fog( 0xffffff, 0, 512 );
scene.add( new DaylightSystem() );
let renderer;

// TODO: Consolidate all of this into player
// let controls;
let player;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const blocker = document.getElementById( "blocker" );
const keyboardHandlers = {

	// Escape
	27: {
		down() {
			if ( !player.enabled ) {
				player.enabled = true;
				blocker.style.display = "none";
				document.body.requestPointerLock();
			} else {
				player.enabled = false;
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
			if ( canJump ) {
				player.getModel().velocity.z += 50;
			}
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
		player.enabled = true;
		blocker.style.display = "none";
	} else {
		player.enabled = false;
		blocker.style.display = "block";
	}
};

// Hook pointer lock state change events

function init() {
	camera = new PerspectiveCamera(
		75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	// controls = new PointerLockControls( camera );
	// scene.add( controls.getObject() );

	player = new Player( camera );
	scene.add( player.getModel() );
	scene.add( new TestArea() );

	document.addEventListener( "keydown", handleKeyboard, false );
	document.addEventListener( "keyup", handleKeyboard, false );
	document.addEventListener( "pointerlockchange", pointerlockchange, false );

	renderer = new WebGLRenderer({
		antialias: false
	});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0xFFFFFF );
	document.body.appendChild( renderer.domElement );
	window.addEventListener( "resize", onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {

	// Move to player
	if ( player.enabled ) {
		const time = performance.now();
		const delta = ( time - prevTime ) / 1000; // Use s instead of ms
		prevTime = time;

		const model = player.getModel();

		// Retarding forces
		model.velocity.x -= model.velocity.x * 10.0 * delta; // Logarithmic decrease
		model.velocity.y -= model.velocity.y * 10.0 * delta; // Logarithmic decrease
		model.velocity.z -= 9.8 * 50.0 * delta; // 50.0 = mass <- makes no sense

		player.direction.y = Number( moveForward ) - Number( moveBackward );
		player.direction.x = Number( moveRight ) - Number( moveLeft );
		// direction.normalize(); // this ensures consistent movements in all directions
		// Without it, we move faster diagonally by more than 40%

		// Magic numbers here.
		model.velocity.x += player.direction.x * 100 * delta;
		model.velocity.y += player.direction.y * 100 * delta;

		collisionDetection( player );

		model.translateX( model.velocity.x * delta );
		model.translateY( model.velocity.y * delta );
		model.translateZ( model.velocity.z * delta );
		// player.position.copy( controls.getObject() );
		// player.position.z -= 1.5;
	}
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

function collisionDetection( player ) {

	for ( const side in player.raycasters ) {
		if ( player.raycasters.hasOwnProperty( side ) ) {
			player.raycasters[ side ].ray.origin.copy(
				player.position
			);
		}
	}

	/*
		NOTE: This part is a little bit verbose but leaves it easier to use a
		different collision method in the future.
	*/

	function hasCollisions( raycaster ) {
		return raycaster.intersectObjects( scene.children, true ).length > 0;
	}

	// If touching on the left (-X) side, force X velocity to be >= 0
	if ( hasCollisions( player.raycasters.left ) ) {
		player.velocity.x = Math.max( 0, player.velocity.x );
	}

	// If touching on the right (+X) side, force X velocity to be <= 0
	if ( hasCollisions( player.raycasters.right ) ) {
		player.velocity.x = Math.min( 0, player.velocity.x );
	}

	// TODO: Switch y and z

	// If touching on the back (-Z) side, force Z velocity to be >= 0
	if ( hasCollisions( player.raycasters.back ) ) {
		player.velocity.y = Math.max( 0, player.velocity.y );
	}

	// If touching on the front (+Z) side, force Z velocity to be <= 0
	if ( hasCollisions( player.raycasters.front ) ) {
		player.velocity.y = Math.min( 0, player.velocity.y );
	}

	// If touching on the bottom (-Y) side, force Y velocity to be >= 0
	if ( hasCollisions( player.raycasters.bottom ) ) {
		console.log( "hit something at least 1.5 below" );
		player.velocity.z = Math.max( 0, player.velocity.z );
		canJump = true;
	}

	// If touching on the top (+Y) side, force Y velocity to be <= 0
	if ( hasCollisions( player.raycasters.top ) ) {
		player.velocity.z = Math.min( 0, player.velocity.z );
	}

}

init();
animate();
