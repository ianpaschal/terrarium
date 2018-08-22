// Terrarium is distributed under the MIT license.

// import TestArea from "../world/TestArea";
import SystemLite from "../SystemLite";
import SimplexNoise from "simplex-noise";
import { Vector3, PlaneGeometry, MeshLambertMaterial, Mesh } from "three";
import Chunk from "../../Chunk";

const init = function() {
	// const terrain = new TestArea();
	// this._engine.scene.add( terrain );
	this.generator = new SimplexNoise();

	console.log( "generating terrain" );

	this.chunks = [];

	const worldSize = 4;
	const scale = 16;

	for ( let chunkX = worldSize / -2; chunkX < worldSize / 2; chunkX++ ) {
		for ( let chunkY = worldSize / -2; chunkY < worldSize / 2; chunkY++ ) {
			const chunkPosition = new Vector3( chunkX * 16, chunkY * 16, 0 );

			let chunkData = [];

			// Fill chunk in columns based on elevation
			for ( let x = 0; x < 16; x++ ) {
				for ( let y = 0; y < 16; y++ ) {
					const elevation = Math.round( this.generator.noise2D(
						( chunkPosition.x + x ) / scale,
						( chunkPosition.y + y ) / scale
					) * 4 ) + 4;
					const column = [ 1 ];
					for ( let z = 1; z < elevation; z++ ) {
						column.push( 1 );
					}
					while ( column.length < 16 ) {
						column.push( 0 );
					}
					chunkData = chunkData.concat( column );
				}
			}

			// Now create a chunk with the data:
			const chunk = new Chunk( chunkPosition, chunkData );
			chunk.mesh.position.copy( chunkPosition );
			this._engine.scene.add( chunk.mesh );
		}
	}

	const floorGeometry = new PlaneGeometry( 1024, 1024, 1, 1 );
	const floorMaterial = new MeshLambertMaterial({ color: 0xEEEEEE });
	const floor = new Mesh( floorGeometry, floorMaterial );
	// floor.position.z -= 4;
	this._engine.scene.add( floor );
};

const update = function( t ) {
	// Do nothing for now

	// Check where player is

	// If there is not a chunk for all chunks surrounding, generate it
};

function generateChunkData() {

}

export default new SystemLite( init, update );
