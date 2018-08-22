class SystemLite {

	constructor( initFn, updateFn ) {
		this._initFn = initFn;
		this._updateFn = updateFn;
	}
	init( engine ) {
		this._engine = engine;

		this._initFn();
	}

	update( t ) {
		this._updateFn( t );
	}
}

export default SystemLite;
