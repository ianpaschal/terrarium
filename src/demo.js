// Single imports make it easier to swap out a Three.js component for our own
import {
	Box3,
	Box3Helper,
	Fog,
	PerspectiveCamera,
	Scene,
	Raycaster,
	Vector2,
	Vector3,
	WebGLRenderer
} from "three";
import DaylightSystem from "./world/DaylightSystem";
import TestArea from "./world/TestArea";
import Player from "./Player";

let camera;
let debugCamera;
const mouse = new Vector2( 0, 0 );
const raycaster = new Raycaster( new Vector3(), new Vector3(), 0, 8 );
const scene = new Scene();
scene.fog = new Fog( 0xffffff, 0, 512 );
scene.add( new DaylightSystem() );
let renderer;
let colliderHelper;
// TODO: Consolidate all of this into player
let player;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = true;
const world = new TestArea();

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
				player.getModel().velocity.z += 10;
			}
			// canJump = false;
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

function init() {
	camera = new PerspectiveCamera(
		75, window.innerWidth / window.innerHeight, 0.01, 1000
	);
	player = new Player( camera );
	player.getModel().position.set( -8, -8, 1 );

	colliderHelper = new Box3Helper( player.AABB, 0xFFFFFF );
	scene.add( colliderHelper );
	scene.add( player.getModel() );
	scene.add( world );

	debugCamera = new PerspectiveCamera(
		75, window.innerWidth / window.innerHeight, 0.01, 1000
	);
	debugCamera.up.set( 0, 0, 1 );
	debugCamera.position.set( -32, -32, 32 );
	debugCamera.lookAt( new Vector3( 0, 0, 0 ) );

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

function getHorizontalMovement() {
	const input = new Vector2();
	if ( moveLeft ) {
		input.x -= 1;
	}
	if ( moveRight ) {
		input.x += 1;
	}
	if ( moveForward ) {
		input.y += 1;
	}
	if ( moveBackward ) {
		input.y -= 1;
	}
	input.normalize();
	input.rotateAround( new Vector2( 0, 0 ), player.model.rotation.z );
	return input;
}

function animate() {

	// Move to player
	if ( player.enabled ) {
		const time = performance.now();
		const delta = ( time - prevTime ) / 1000; // Use s instead of ms
		prevTime = time;

		// Compute the player input, normalize the INPUT
		const horizontalMovement = getHorizontalMovement();

		// TODO: Right now this is weird and non physicsy. Replace with proper accelerations

		const model = player.getModel();

		// Apply retarding forces
		// These are applied regardless if player is touching ground
		// model.velocity.x -= model.velocity.x * 10 * delta;
		// model.velocity.y -= model.velocity.y * 10 * delta;

		const playerSpeed = 100;

		// If touching the ground, apply movement; if not, apply gravity
		if ( canJump ) {
			model.velocity.x -= model.velocity.x * 10 * delta;
			model.velocity.y -= model.velocity.y * 10 * delta;
			model.velocity.x += horizontalMovement.x * playerSpeed * delta;
			model.velocity.y += horizontalMovement.y * playerSpeed * delta;
		} else {
			model.velocity.x -= model.velocity.x * 1 * delta;
			model.velocity.y -= model.velocity.y * 1 * delta;
			model.velocity.z -= 9.8 * delta;
		}

		// Get intended movement and compute collisions
		const movement = model.velocity.clone().multiplyScalar( delta );
		const collisions = findCollisions( movement );

		console.log( collisions.x, collisions.y, collisions.z );

		canJump = collisions.z;

		const constrained = constrainMotion( collisions, movement );

		// if ( movement.y > 0.01 ||  movement.y < -0.01 ) {
		// 	console.log( "Original:", movement.y, "Constrained:", constrained.y );
		// }

		// Convert to constrained movement and apply to the player position
		model.position.add( constrained );
		// model.position.add( movement );
		// begin old code

		// // Retarding forces
		// model.velocity.x -= model.velocity.x * 10.0 * delta; // Logarithmic decrease
		// model.velocity.y -= model.velocity.y * 10.0 * delta; // Logarithmic decrease
		// model.velocity.z -= 9.8 * delta; // 50.0 = mass <- makes no sense
		// player.direction.y = Number( moveForward ) - Number( moveBackward );
		// player.direction.x = Number( moveRight ) - Number( moveLeft );
		// player.direction.normalize(); // this ensures consistent movements in all directions
		// // Without it, we move faster diagonally by more than 40%
		// // Magic numbers here.
		// model.velocity.x += player.direction.x * 100 * delta;
		// model.velocity.y += player.direction.y * 100 * delta;
		//
		// model.translateX( model.velocity.x * delta );
		// model.translateY( model.velocity.y * delta );
		// model.translateZ( model.velocity.z * delta );

		// end old code
	}
	raycaster.setFromCamera( mouse, camera );
	const intersects = raycaster.intersectObjects( world.children, true );
	// const hoverMat = new MeshLambertMaterial({ color: 0xFF00FF });
	if ( intersects[ 0 ] ) {
		// intersects[ 0 ].object.material = hoverMat;
	}
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

function findCollisions( distance ) {
	const model = player.getModel();
	player.AABB.setFromCenterAndSize(
		model.position,
		new Vector3( 0.7, 0.7, 1.8 )
	);

	const raycaster = new Raycaster();

	// We only check for collisions in teh direction the player is moving
	// this means that velocity is always zero'd if any collision is detected,
	// its cleaner to just keep track of which axis will be zero'd
	const collisions = {
		x: false,
		y: false,
		z: false
	};
	const origins = {
		x: {
			neg: [
				new Vector3( player.AABB.min.x, player.AABB.min.y, player.AABB.min.z ),
				new Vector3( player.AABB.min.x, player.AABB.max.y, player.AABB.min.z ),
				new Vector3( player.AABB.min.x, player.AABB.min.y, player.AABB.max.z ),
				new Vector3( player.AABB.min.x, player.AABB.max.y, player.AABB.max.z )
			],
			pos: [
				new Vector3( player.AABB.max.x, player.AABB.min.y, player.AABB.min.z ),
				new Vector3( player.AABB.max.x, player.AABB.max.y, player.AABB.min.z ),
				new Vector3( player.AABB.max.x, player.AABB.min.y, player.AABB.max.z ),
				new Vector3( player.AABB.max.x, player.AABB.max.y, player.AABB.max.z )
			]
		},
		y: {
			neg: [
				new Vector3( player.AABB.min.x, player.AABB.min.y, player.AABB.min.z ),
				new Vector3( player.AABB.max.x, player.AABB.min.y, player.AABB.min.z ),
				new Vector3( player.AABB.min.x, player.AABB.min.y, player.AABB.max.z ),
				new Vector3( player.AABB.max.x, player.AABB.min.y, player.AABB.max.z )
			],
			pos: [
				new Vector3( player.AABB.min.x, player.AABB.max.y, player.AABB.min.z ),
				new Vector3( player.AABB.max.x, player.AABB.max.y, player.AABB.min.z ),
				new Vector3( player.AABB.min.x, player.AABB.max.y, player.AABB.max.z ),
				new Vector3( player.AABB.max.x, player.AABB.max.y, player.AABB.max.z )
			]
		},
		z: {
			neg: [
				new Vector3( model.position.x, model.position.y, player.AABB.min.z )
			],
			pos: [
				new Vector3( model.position.x, model.position.y, player.AABB.max.z )
			]
		}
	};

	// Check for collisions
	function check( origin, direction, extent ) {
		const raycaster = new Raycaster( origin, direction, 0, extent );
		const intersects = raycaster.intersectObjects( world.children, true );
		return intersects[ 0 ] ? true : false;
	}

	const axes = [ "x", "y", "z" ];

	const directions = {
		x: {
			neg: new Vector3( -1, 0, 0 ),
			pos: new Vector3( 1, 0, 0 )
		},
		y: {
			neg: new Vector3( 0, -1, 0 ),
			pos: new Vector3( 0, 1, 0 )
		},
		z: {
			neg: new Vector3( 0, 0, -1 ),
			pos: new Vector3( 0, 0, 1 )
		}
	};

	axes.forEach( ( axis ) => {
		let direction;
		let startingPoints;
		if ( player.model.velocity[ axis ] < 0 ) {
			direction = directions[ axis ].neg;
			startingPoints = origins[ axis ].neg;
		}
		if ( player.model.velocity[ axis ] > 0 ) {
			direction = directions[ axis ].pos;
			startingPoints = origins[ axis ].pos;
		}
		if ( startingPoints ) {
			startingPoints.forEach( ( origin ) => {

				// Set the raycaster to use the correct origin, direction, and distance
				raycaster.set( origin, direction );
				raycaster.far = Math.abs( distance[ axis ] );

				const intersects = raycaster.intersectObjects( world.children, true );
				if ( intersects[ 0 ] ) {
					collisions[ axis ] = true;
				}
			});
		}
	});
	return collisions;
}

function constrainMotion( limits, target ) {
	const result = new Vector3();
	result.x = limits.x ? 0 : target.x;
	result.y = limits.y ? 0 : target.y;
	result.z = limits.z ? 0 : target.z;
	return result;
}

init();
animate();
