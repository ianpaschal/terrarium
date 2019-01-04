// Terrarium is distributed under the MIT license.

class KeyboardControls {

	constructor() {
		this.handlers = {};
		this.pressed = {};

		document.addEventListener( "keydown", _handle.bind( this ), false );
		document.addEventListener( "keyup", _handle.bind( this ), false );

		function _handle( e ) {
			console.log( e.which );
			if ( this.handlers[ e.keyCode ] ) {
				if ( e.type === "keydown" ) {
					this.pressed[ e.keyCode ] = true;
					if ( this.handlers[ e.keyCode ].down ) {
						this.handlers[ e.keyCode ].down();
					}
				}
				if ( e.type === "keyup" ) {
					this.pressed[ e.keyCode ] = false;
					if ( this.handlers[ e.keyCode ].up ) {
						this.handlers[ e.keyCode ].up();
					}
				}
			}
		}
	}

	/**
	 * @description Add a pair of handler functions for a given keycode.
	 * @param {Number} keycode - Keycode to handle
	 * @param {Function} down - Function to run when key is pressed
	 * @param {Function} up - Function to run when key is released
	 */
	addHandler( keycode, down, up ) {
		const empty = () => {};
		this.handlers[ keycode ] = {};
		this.handlers[ keycode ].up = up || empty;
		this.handlers[ keycode ].down = down || empty;
	}

	/**
	 * @description Check if key is currently being pressed or not.
	 * @param {Number} keycode - Keycode to check
	 * @returns {Boolean} - Whether or not the given key is pressed
	 */
	isPressed( keycode ) {
		return this.pressed[ keycode ] ? true : false;
	}
}
export default KeyboardControls;
