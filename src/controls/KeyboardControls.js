class KeyboardControls {

	constructor() {
		this.handlers = {};
		document.addEventListener( "keydown", _handle.bind( this ), false );
		document.addEventListener( "keyup", _handle.bind( this ), false );

		function _handle( e ) {
			if ( this.handlers[ e.keyCode ] ) {
				if ( e.type === "keydown" && this.handlers[ e.keyCode ].down ) {
					this.handlers[ e.keyCode ].down();
				}
				if ( e.type === "keyup" && this.handlers[ e.keyCode ].up ) {
					this.handlers[ e.keyCode ].up();
				}
			}
		}
	}

	assignHandler( keycode, down, up ) {
		const empty = () => {};
		this.handlers[ keycode ] = {};
		this.handlers[ keycode ].up = up || empty;
		this.handlers[ keycode ].down = down || empty;
	}
}
export default KeyboardControls;
