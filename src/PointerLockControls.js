import { Object3D } from "three";

class PointerLockControls {
	constructor( camera ) {
		camera.rotation.set( 0, 0, 0 );
		this.pitchObject = new Object3D();
		this.pitchObject.add( camera );
		this.yawObject = new Object3D();
		this.yawObject.position.y = 10;
		this.yawObject.add( this.pitchObject );
		document.addEventListener( "mousemove", this.move.bind( this ), false );
		this.enabled = false;
	}

	move( e ) {
		if ( !this.enabled ) return;
		const movementX = e.movementX || 0;
		const movementY = e.movementY || 0;
		const PI_2 = Math.PI / 2;
		this.yawObject.rotation.y -= movementX * 0.002;
		this.pitchObject.rotation.x -= movementY * 0.002;
		this.pitchObject.rotation.x = Math.max(
			- PI_2,
			Math.min(
				PI_2, this.pitchObject.rotation.x
			)
		);
	}

	dispose() {
		document.removeEventListener( "mousemove", this.onMouseMove, false );
	}

	getObject() {
		return this.yawObject;
	}
}
export default PointerLockControls;
