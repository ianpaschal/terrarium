// Voxeland is distributed under the MIT license.

import {
	Mesh,
	MeshLambertMaterial,
	Object3D,
	PlaneGeometry,
	Vector3
} from "three";

import Chunk from "../chunk";
import testChunk from "../testChunk";

class TestArea {
	constructor() {
		this.root = new Object3D();

		// floor
		const floorGeometry = new PlaneGeometry( 100, 100, 1, 1 );
		const floorMaterial = new MeshLambertMaterial({ color: 0xEEEEEE });
		const floor = new Mesh( floorGeometry, floorMaterial );
		const chunk = new Chunk( new Vector3( 0, 0, 0 ), testChunk );

		this.root.add( floor );
		this.root.add( chunk.mesh );

		return this.root;
	}
}

export default TestArea;
