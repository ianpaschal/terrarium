// Terrarium is distributed under the MIT license.

// import TestArea from "../world/TestArea";
import { System, Entity } from "aurora";
import SimplexNoise from "simplex-noise";
// import Chunk from "../../core/Chunk";

/**
 * This system is soley responsible for generating new voxel data for the world. It does not handle
 * mesh generation or loading and unloading data.
 */
export default new System({
	name: "terrain-generation",

	// TODO: Add conditional component types so we can add the player for location-based generation
	componentTypes: [
		"voxel-data"
	],
	onInit() {

		// Create the generator
		this.generator = new SimplexNoise();

		// Store chunks here
		this.chunks = [];

		const worldSize = 8;
		const scale = 32;

		for ( let chunkX = worldSize / -2; chunkX < worldSize / 2; chunkX++ ) {
			for ( let chunkY = worldSize / -2; chunkY < worldSize / 2; chunkY++ ) {
				const chunkPosition = {
					x: chunkX * 16,
					y: chunkY * 16,
					z: 0
				};

				// The chunk mesh is only 16 x 16 x 16 but by including an extra row, we can
				// generate the geometry far easier because we know what the first row of the next
				// chunk will be
				let chunkData = [];

				// Fill chunk in columns based on elevation

				for ( let x = 0; x <= 16; x++ ) {
					for ( let y = 0; y <= 16; y++ ) {
						const elevation = Math.round( this.generator.noise2D(
							( chunkPosition.x + x ) / scale,
							( chunkPosition.y + y ) / scale
						) * 4 ) + 4;
						const column = [ 1 ];
						for ( let z = 1; z < elevation; z++ ) {
							column.push( 1 );
						}
						while ( column.length <= 16 ) {
							column.push( 0 );
						}
						chunkData = chunkData.concat( column );
					}
				}

				// Now create a chunk with the data:
				// const chunk = new Chunk( chunkPosition, chunkData );
				// this.chunks.push( chunk );
				this._engine.addEntity( new Entity({
					type: "terrain-chunk",
					components: [
						{
							type: "voxel-data",
							data: chunkData
						},
						{
							type: "chunk-position",
							data: {
								x: chunkPosition.x,
								y: chunkPosition.y,
								z: chunkPosition.z
							}
						}
					]
				}) );
			}
		}
	},
	onUpdate() {
		// Generate some new terrain based on the player's positions
	}
});
