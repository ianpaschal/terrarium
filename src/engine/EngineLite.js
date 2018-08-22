import { Scene } from "three";

class EngineLite {
	constructor() {
		this._scene = new Scene();
		this._systems = [];
	}
	get scene() {
		return this._scene;
	}
	addSystem( system ) {
		system.init( this );
		this._systems.push( system );
	}
	update( t ) {
		this._systems.forEach( ( system ) => {
			system.update( t );
		});
	}
}

export default EngineLite;
