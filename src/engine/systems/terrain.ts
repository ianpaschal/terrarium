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
	methods: {
		setVoxel( data ) {
			const { position, value } = data;

			// Get correct chunk for position
			const chunkPosition = new Vector3(
				Math.floor( position.x / 16 ) * 16,
				Math.floor( position.y / 16 ) * 16,
				Math.floor( position.z / 16 ) * 16
			);

			const chunk = this.chunks.find( ( element ) => {
				return element.position.equals( chunkPosition );
			});

			// Get index for voxel in that position
			const i = chunk.getBlockIndex( new Vector3(
				position.x - chunkPosition.x,
				position.y - chunkPosition.y,
				position.z - chunkPosition.z
			) );

			// Modify that chunk at that index (automatically regenerates mesh)
			chunk.setVoxelData( i, value );
			chunk.generateGeometry();
		}
	},
	onInit() {

		this.generator = new SimplexNoise();

		this.chunks = [];

		const terrain = new Object3D();
		terrain.name = "terrain";

		const worldSize = 8;
		const scale = 32;

		for ( let chunkX = worldSize / -2; chunkX < worldSize / 2; chunkX++ ) {
			for ( let chunkY = worldSize / -2; chunkY < worldSize / 2; chunkY++ ) {
				const chunkPosition = new Vector3( chunkX * 16, chunkY * 16, 0 );

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
				const chunk = new Chunk( chunkPosition, chunkData );
				this.chunks.push( chunk );
			}
		}

		// Update all contact maps
		this.chunks.forEach( ( chunk ) => {
			chunk.updateMesh();
			terrain.add( chunk.mesh );
		});

		scene.add( terrain );

		// TODO: Merge all geometry into single geometry in order to batch render calls
	},
	onAddEntity() {
		// Do nothing for now
	},
	onUpdate() {
		// Check where player is
		// If there is not a chunk for all chunks surrounding, generate it
	}
});