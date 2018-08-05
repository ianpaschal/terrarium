import { Box3, Object3D, Vector2, Vector3 } from "three";
import PointerLockControls from "./controls/PointerLockControls";
import KeyboardControls from "./controls/KeyboardControls";

function clip( min, value, max ) {
	return Math.max( min, Math.min( max, value ) );
}

class Player {

	constructor( camera ) {
		this.model = new Object3D();
		this.model.velocity = new Vector3();
		this.model.acceleration = new Vector3();

		this.controls = new PointerLockControls( camera );

		this.keyboardControls = new KeyboardControls();

		camera.up.set( 0, 0, 1 );
		camera.lookAt( new Vector3( 0, 1, 0 ) );

		this.AABB = new Box3();

		this.pitchObject = new Object3D();
		this.pitchObject.add( camera );
		this.pitchObject.position.z += 0.5;
		this.model.add( this.pitchObject );
		document.addEventListener( "mousemove", this.look.bind( this ), false );
		this.enabled = false;

		this.model.add( this.controls.getObject() );

		// Assign handlers
		// Esc
		this.keyboardControls.assignHandler( 27, () => {
			if ( !this.enabled ) {
				this.enabled = true;
				const blocker = document.getElementById( "blocker" );
				blocker.style.display = "none";
				document.body.requestPointerLock();
			} else {
				this.enabled = false;
				const blocker = document.getElementById( "blocker" );
				blocker.style.display = "";
				document.exitPointerLock();
			}
		});

		// Space
		this.keyboardControls.assignHandler( 32, () => {
			if ( this.collisions.z ) {
				this.model.velocity.z += 10;
			}
		});

		// A
		this.keyboardControls.assignHandler( 65, () => {
			this.input.left = true;
		}, () => {
			this.input.left = false;
		});

		// D
		this.keyboardControls.assignHandler( 68, () => {
			this.input.right = true;
		}, () => {
			this.input.right = false;
		});

		// S
		this.keyboardControls.assignHandler( 83, () => {
			this.input.backward = true;
		}, () => {
			this.input.backward = false;
		});

		// W
		this.keyboardControls.assignHandler( 87, () => {
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
			right: false
		};

	}

	getModel() {
		return this.model;
	}

	look( e ) {
		if ( !this.enabled ) return;
		const movementX = e.movementX || 0;
		const movementY = e.movementY || 0;
		const PI_2 = Math.PI / 2;
		this.model.rotation.z -= movementX * 0.002;
		this.pitchObject.rotation.x -= movementY * 0.002;

		// Limit pitch to to ±90º
		this.pitchObject.rotation.x = clip(
			-PI_2, this.pitchObject.rotation.x, PI_2
		);
	}

	getHorizontalMovement() {
		const input = new Vector2();
		if ( this.input.left ) {
			input.x -= 1;
		}
		if ( this.input.right ) {
			input.x += 1;
		}
		if ( this.input.forward ) {
			input.y += 1;
		}
		if ( this.input.backward ) {
			input.y -= 1;
		}
		input.normalize();
		input.rotateAround( new Vector2( 0, 0 ), this.model.rotation.z );
		return input;
	}

	get velocity() {
		return this.model.velocity;
	}
	set velocity( vector ) {
		this.model.velocity = vector;
	}
}
export default Player;
