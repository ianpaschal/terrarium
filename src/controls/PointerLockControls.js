// Terrarium is distributed under the MIT license.

function clip( min, value, max ) {
	return Math.max( min, Math.min( max, value ) );
}

class PointerLockControls {
	constructor() {

		this.pitch = 0;
		this.yaw = 0;
		this.sensitivity = {
			x: 0.5,
			y: 0.5
		};

		this.handlers = {
			0: undefined,
			1: undefined,
			2: undefined,
			"move": undefined
		};

		document.addEventListener( "mousemove", this.look.bind( this ), false );
		document.addEventListener( "mousedown", this.click.bind( this ), false );
		this.enabled = false;
	}

	addHandler( button, fn ) {
		this.handlers[ button ] = fn;
	}

	look( e ) {
		if ( !this.enabled ) {
			return;
		}
		this.yaw -= e.movementX * ( this.sensitivity.x / 256 );
		this.pitch -= e.movementY * ( this.sensitivity.y / 256 );

		// Limit pitch to to ±90º
		this.pitch = clip( Math.PI / -2, this.pitch, Math.PI / 2 );

		// Apply it back to the player
		if ( this.handlers.move ) {
			this.handlers.move( this.pitch, this.yaw );
		}
	}

	click( e ) {
		if ( this.handlers[ e.button ] ) {
			this.handlers[ e.button ]();
		}
	}
}
export default PointerLockControls;
