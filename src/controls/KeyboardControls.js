class KeyboardControls {

	constructor() {
		this.handlers = {};
		this.pressed = {};

		document.addEventListener( "keydown", _handle.bind( this ), false );
		document.addEventListener( "keyup", _handle.bind( this ), false );

		function _handle( e ) {
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

	addHandler( keycode, down, up ) {
		const empty = () => {};
		this.handlers[ keycode ] = {};
		this.handlers[ keycode ].up = up || empty;
		this.handlers[ keycode ].down = down || empty;
	}

	/**
	 * Check if key is currently being pressed or not.
	 * @param {Number} keycode - Keycode to check
	 * @returns {Boolean} - Whether or not the given key is pressed
	 */
	isPressed( keycode ) {
		return this.pressed[ keycode ] ? true : false;
	}
}
export default KeyboardControls;
