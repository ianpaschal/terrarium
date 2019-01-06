// Terrarium is distributed under the MIT license.

// import TestArea from "../world/TestArea";
import { System } from "aurora";
import SimplexNoise from "simplex-noise";
import { Vector3, Object3D } from "three";
import Chunk from "../../core/Chunk";
import scene from "../../scene";

export default new System({
	name: "modify-voxels",
	fixed: false,
	step: 500,
	componentTypes: [
		"chunk"
	],
	methods: {
		setVoxel( position, value ) {

			// Get correct chunk for position
			const chunkPosition = new Vector3(
				Math.floor( position.x / 16 ) * 16,
				Math.floor( position.y / 16 ) * 16,
				Math.floor( position.z / 16 ) * 16
			);
			// Cycle through entity IDs
			// For each one, get the entity, if it has the location return it

			let chunk;
			this._entityUUIDs.forEach( ( id ) => {
				const candidate = this._engine.getEntity( id );
				const candidatePosition = candidate.getComponentData( "position" );
				if (
					candidatePosition.x === chunkPosition.x &&
					candidatePosition.y === chunkPosition.y &&
					candidatePosition.z === chunkPosition.z
				) {
					chunk = candidate;
				}
			});

			const voxelPosition = new Vector3(
				position.x - chunkPosition.x,
				position.y - chunkPosition.y,
				position.z - chunkPosition.z
			);

			// Get index for voxel in that position

			// Modify that chunk at that index

			// Regenerate mesh
		}
	},
	onInit() {
		// Do nothing for now
	},
	onAddEntity() {
		// Do nothing for now
	},
	onUpdate() {
		// Do nothing for now
	}
});
