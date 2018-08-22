// Voxeland is distributed under the MIT license.

import { Box3, Vector3, Raycaster } from "three";
import SystemLite from "../engine/SystemLite";

const init = function() {
	// Do nothing for now
};

const update = function( t ) {

	t = t / 1000; // Use s instead of ms

	// Compute the player input, normalize the INPUT
	const horizontalMovement = this._engine.player.getHorizontalMovement();

	// TODO: Right now this is weird and non physicsy. Replace with proper accelerations

	const model = this._engine.player.getModel();
	const playerSpeed = 100;

	// If touching the ground, apply movement; if not, apply gravity
	if ( this._engine.player.collisions.z ) {
		model.velocity.x -= model.velocity.x * 10 * t;
		model.velocity.y -= model.velocity.y * 10 * t;
		model.velocity.x += horizontalMovement.x * playerSpeed * t;
		model.velocity.y += horizontalMovement.y * playerSpeed * t;
	} else {
		model.velocity.x -= model.velocity.x * 1 * t;
		model.velocity.y -= model.velocity.y * 1 * t;
		model.velocity.z -= 9.8 * t;
	}

	// Get intended movement and compute collisions
	const movement = model.velocity.clone().multiplyScalar( t );
	this._engine.player.collisions = findCollisions(
		model,
		this._engine.scene,
		movement
	);
	const constrained = constrainMotion(
		this._engine.player.collisions,
		movement
	);

	// Convert to constrained movement and apply to the player position
	model.position.add( constrained );
};

function findCollisions( model, scene, distance ) {
	const AABB = new Box3();

	AABB.setFromCenterAndSize(
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
				new Vector3( AABB.min.x, AABB.min.y, AABB.min.z ),
				new Vector3( AABB.min.x, AABB.max.y, AABB.min.z ),
				new Vector3( AABB.min.x, AABB.min.y, AABB.max.z ),
				new Vector3( AABB.min.x, AABB.max.y, AABB.max.z )
			],
			pos: [
				new Vector3( AABB.max.x, AABB.min.y, AABB.min.z ),
				new Vector3( AABB.max.x, AABB.max.y, AABB.min.z ),
				new Vector3( AABB.max.x, AABB.min.y, AABB.max.z ),
				new Vector3( AABB.max.x, AABB.max.y, AABB.max.z )
			]
		},
		y: {
			neg: [
				new Vector3( AABB.min.x, AABB.min.y, AABB.min.z ),
				new Vector3( AABB.max.x, AABB.min.y, AABB.min.z ),
				new Vector3( AABB.min.x, AABB.min.y, AABB.max.z ),
				new Vector3( AABB.max.x, AABB.min.y, AABB.max.z )
			],
			pos: [
				new Vector3( AABB.min.x, AABB.max.y, AABB.min.z ),
				new Vector3( AABB.max.x, AABB.max.y, AABB.min.z ),
				new Vector3( AABB.min.x, AABB.max.y, AABB.max.z ),
				new Vector3( AABB.max.x, AABB.max.y, AABB.max.z )
			]
		},
		z: {
			neg: [
				new Vector3( model.position.x, model.position.y, AABB.min.z )
			],
			pos: [
				new Vector3( model.position.x, model.position.y, AABB.max.z )
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
		if ( model.velocity[ axis ] < 0 ) {
			direction = directions[ axis ].neg;
			startingPoints = origins[ axis ].neg;
		}
		if ( model.velocity[ axis ] > 0 ) {
			direction = directions[ axis ].pos;
			startingPoints = origins[ axis ].pos;
		}
		if ( startingPoints ) {
			startingPoints.forEach( ( origin ) => {

				// Set the raycaster to use the correct origin, direction, and distance
				collisionRaycaster.set( origin, direction );
				collisionRaycaster.far = Math.abs( distance[ axis ] );

				const intersects = collisionRaycaster.intersectObjects(
					scene.children,
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

export default new SystemLite( init, update );
