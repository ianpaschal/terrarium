// Terrarium is distributed under the MIT license.

// import TestArea from "../world/TestArea";
import { System } from "aurora";
import SimplexNoise from "simplex-noise";
import { Vector3, Object3D } from "three";
import Chunk from "../../core/Chunk";
import scene from "../../scene";

export default new System({
	name: "terrain-generation",
	fixed: false,
	step: 500,
	componentTypes: [
		"chunk"
	],
	onInit() {

		this.generator = new SimplexNoise();

		this.chunks = [];

		const terrain = new Object3D();
		terrain.name = "terrain";

		const worldSize = 4;
		const scale = 32;

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
				terrain.add( chunk.mesh );
				// this._engine.chunks.push( chunk );
				// this._engine.chunkMeshes.push( chunk.mesh );
			}
		}
		console.log( terrain );
		scene.add( terrain );
	},
	onAddEntity() {
		// Do nothing for now
	},
	onUpdate() {
		// Check where player is
		// If there is not a chunk for all chunks surrounding, generate it
	}
});
