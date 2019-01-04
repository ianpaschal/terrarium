// Terrarium is distributed under the MIT license.

import { Box3, Object3D, Vector2, Vector3, Raycaster } from "three";
import PointerLockControls from "../controls/PointerLockControls";
import KeyboardControls from "../controls/KeyboardControls";
import VoxelCursor from "../controls/VoxelCursor";

class Player {

	constructor( camera ) {
		this.model = new Object3D();
		this.model.velocity = new Vector3();
		this.model.acceleration = new Vector3();
		this.camera = camera;
		camera.up.set( 0, 0, 1 );
		this.camera.rotation.set( Math.PI / 2, 0, 0 );
		this.pitchObject = new Object3D();
		this.pitchObject.add( camera );
		this.model.position.z = 10;
		this.model.add( this.pitchObject );
		this.AABB = new Box3();

		this.mouse = new Vector2( 0, 0 );
		this.raycaster = new Raycaster( new Vector3(), new Vector3(), 0, 8 );

		this.mode = 0;

		this.mouseControls = new PointerLockControls();
		this.keyboardControls = new KeyboardControls();
		this.mouseControls.addHandler( "move", ( pitch, yaw ) => {
			this.model.rotation.z = yaw;
			this.pitchObject.rotation.x = pitch;
		});
		this.mouseControls.addHandler( 0, () => {
			console.log( "Left clicked!" );
		});
		this.mouseControls.addHandler( 2, () => {
			console.log( "Right clicked!" );
		});

		// Assign handlers
		// Esc
		this.keyboardControls.addHandler( 27, () => {
			if ( !this.enabled ) {
				this.mouseControls.enabled = true;
				this.enabled = true;
				const blocker = document.getElementById( "blocker" );
				blocker.style.display = "none";
				document.body.requestPointerLock();
			} else {
				this.mouseControls.enabled = false;
				this.enabled = false;
				const blocker = document.getElementById( "blocker" );
				blocker.style.display = "";
				document.exitPointerLock();
			}
		});

		// Space
		this.keyboardControls.addHandler( 32, () => {
			this.input.up = true;
		}, () => {
			this.input.up = false;
		});

		// Shift
		this.keyboardControls.addHandler( 16, () => {
			this.input.down = true;
		}, () => {
			this.input.down = false;
		});

		// A
		this.keyboardControls.addHandler( 65, () => {
			this.input.left = true;
		}, () => {
			this.input.left = false;
		});

		// D
		this.keyboardControls.addHandler( 68, () => {
			this.input.right = true;
		}, () => {
			this.input.right = false;
		});

		// S
		this.keyboardControls.addHandler( 83, () => {
			this.input.backward = true;
		}, () => {
			this.input.backward = false;
		});

		// W
		this.keyboardControls.addHandler( 87, () => {
			this.input.forward = true;
		}, () => {
			this.input.forward = false;
		});

		this.collisions = {
			x: false,
			y: false,
			z: false
		};

		this.input = {
			forward: false,
			backward: false,
			left: false,
			right: false,
			up: false,
			down: false
		};

	}

	getModel() {
		return this.model;
	}

	get normalInput() {
		let x = 0;
		let y = 0;
		let z = 0;
		if ( this.input.left ) {
			x -= 1;
		}
		if ( this.input.right ) {
			x += 1;
		}
		if ( this.input.forward ) {
			y += 1;
		}
		if ( this.input.backward ) {
			y -= 1;
		}
		if ( this.input.up ) {
			z += 1;
		}
		if ( this.input.down ) {
			z -= 1;
		}
		/**
		 * Normalize the input so that holding forward and left doesn't create a
		 * "faster" or "more powerful" diagonal movement.
		 */
		const horizontal = new Vector2( x, y );
		horizontal.normalize();
		horizontal.rotateAround( new Vector2( 0, 0 ), this.model.rotation.z );

		return new Vector3(
			horizontal.x,
			horizontal.y,
			z
		);
	}

	get velocity() {
		return this.model.velocity;
	}
	set velocity( vector ) {
		this.model.velocity = vector;
	}

	get position() {
		return this.model.position;
	}
	set position( vector ) {
		this.model.position = vector;
	}

	attachCursor( scene ) {
		this.cursor = new VoxelCursor();

		scene.add( this.cursor );

		this.terrain = scene.getObjectByName( "terrain", true );
		
	}
}
export default Player;
