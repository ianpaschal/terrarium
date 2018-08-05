import { Box3, Box3Helper, Object3D, Raycaster, Vector3 } from "three";
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

		this.position = this.model.position;
		this.velocity = this.model.velocity;
		this.acceleration = this.model.acceleration;

		this.direction = new Vector3();

		this.controls = new PointerLockControls( camera );

		this.input = {};
		this.input.keyboard = new KeyboardControls();

		camera.up.set( 0, 0, 1 );
		camera.lookAt( new Vector3( 0, 1, 0 ) );
		camera.position.set( 0, 0, 0.5 );

		this.AABB = new Box3();

		this.pitchObject = new Object3D();
		this.pitchObject.add( camera );
		// this.model = new Object3D();
		// this.pitchObject.position.z = 1.5;
		this.model.add( this.pitchObject );
		document.addEventListener( "mousemove", this.look.bind( this ), false );
		this.enabled = false;

		this.model.add( this.controls.getObject() );
		this.raycasters = {
			right:  new Raycaster( new Vector3(), new Vector3(  1,  0,  0 ), 0, 0.5 ),
			left:   new Raycaster( new Vector3(), new Vector3( -1,  0,  0 ), 0, 0.5 ),
			front:  new Raycaster( new Vector3(), new Vector3(  0,  1,  0 ), 0, 0.5 ),
			back:   new Raycaster( new Vector3(), new Vector3(  0, -1,  0 ), 0, 0.5 ),
			top:    new Raycaster( new Vector3(), new Vector3(  0,  0,  1 ), 0, 0.5 ),
			bottom: new Raycaster( new Vector3(), new Vector3(  0,  0, -1 ), 0, 1.5 )
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
}
export default Player;
