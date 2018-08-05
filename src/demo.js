// Single imports make it easier to swap out a Three.js component for our own
import { PerspectiveCamera, Raycaster,
	Vector2, Vector3, WebGLRenderer } from "three";
import Player from "./Player";
import World from "./world/World";

// TODO: Move to mouse controls or player...
const mouse = new Vector2( 0, 0 );
const raycaster = new Raycaster( new Vector3(), new Vector3(), 0, 8 );

let camera;
let renderer;
let player;

const world = new World();

let prevTime = performance.now();

const pointerlockchange = function() {
	if ( document.pointerLockElement === document.body ) {
		player.enabled = true;
		const blocker = document.getElementById( "blocker" );
		blocker.style.display = "none";
	} else {
		player.enabled = false;
		const blocker = document.getElementById( "blocker" );
		blocker.style.display = "block";
	}
};

function init() {
	camera = new PerspectiveCamera(
		75, window.innerWidth / window.innerHeight, 0.01, 1000
	);
	player = new Player( camera );
	player.getModel().position.set( -8, -8, 1 );

	world.scene.add( player.getModel() );

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

		// Compute the player input, normalize the INPUT
		const horizontalMovement = player.getHorizontalMovement();

		// TODO: Right now this is weird and non physicsy. Replace with proper accelerations

		const model = player.getModel();
		const playerSpeed = 100;

		// If touching the ground, apply movement; if not, apply gravity
		if ( player.collisions.z ) {
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
		player.collisions = findCollisions( movement );
		const constrained = constrainMotion( player.collisions, movement );

		// Convert to constrained movement and apply to the player position
		model.position.add( constrained );
	}
	raycaster.setFromCamera( mouse, camera );
	const intersects = raycaster.intersectObjects( world.scene.children, true );
	// const hoverMat = new MeshLambertMaterial({ color: 0xFF00FF });
	if ( intersects[ 0 ] ) {
		// intersects[ 0 ].object.material = hoverMat;
	}
	renderer.render( world.scene, camera );
	requestAnimationFrame( animate );
}

function findCollisions( distance ) {
	const model = player.getModel();
	player.AABB.setFromCenterAndSize(
		model.position,
		new Vector3( 0.7, 0.7, 1.8 )
	);

	const collisionRaycaster = new Raycaster();

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
				collisionRaycaster.set( origin, direction );
				collisionRaycaster.far = Math.abs( distance[ axis ] );

				const intersects = collisionRaycaster.intersectObjects(
					world.scene.children,
					true
				);
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
