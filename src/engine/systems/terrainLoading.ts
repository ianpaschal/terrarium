// Terrarium is distributed under the MIT license.

// import TestArea from "../world/TestArea";
import { System } from "aurora";
import SimplexNoise from "simplex-noise";
import { Vector3, Object3D } from "three";
import Chunk from "../../core/Chunk";

export default new System({
	name: "terrain-loading",
	componentTypes: [
		"voxel-data",
		"chunk-position"
	],
	methods: {},
	onInit() {
		this.chunkGeometries = [];
	},
	onUpdate() {
		// Do nothing
	},
	onAddEntity() {
		// Generate the mesh and add it to the geometry sets

		const geometryData = {
			indices: [],
			normals: [],
			positions: [],
			uvs: [],
		};
	}
});
