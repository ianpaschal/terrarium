import { Scene } from "three";

class EngineLite {
	constructor() {
		this._scene = new Scene();
		this._systems = [];
	}
	get scene() {
		return this._scene;
	}

	// MASSIVE HACK:
	getChunkContaining( location ) {
		for ( let i = 0; i < this._systems.length; i++ ) {
			const system = this._systems[ i ];
			if ( system.chunks ) {
				console.log( "found terrain system", system.chunks.length );
				for ( let j = 0; j < system.chunks.length; j++ ) {
					const chunk = system.chunks[ j ];
					console.log( "Checking if chunk with bounds", chunk.bounds, "contains", location );
					if ( chunk.bounds.containsPoint( location ) ) {
						console.log( "found one!" );
						return chunk;
					}
				}
			}
		}
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
