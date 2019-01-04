import { Scene } from "three";

class EngineLite {
	constructor() {
		this._scene = new Scene();
		this._systems = [];
		this._chunks = [];
		this._chunkMeshes = [];
	}
	get scene() {
		return this._scene;
	}
	get chunks() {
		return this._chunks;
	}
	get chunkMeshes() {
		return this._chunkMeshes;
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
