import { BoxGeometry,
	Mesh, MeshLambertMaterial, Object3D, PlaneGeometry } from "three";

class TestArea {
	constructor( chunkX, chunkY ) {
		this.root = new Object3D();

		// floor
		const floorGeometry = new PlaneGeometry( 100, 100, 1, 1 );
		const floorMaterial = new MeshLambertMaterial({ color: 0xEEEEEE });
		const floor = new Mesh( floorGeometry, floorMaterial );
		this.root.add( floor );

		// objects
		const boxGeometry = new BoxGeometry( 1, 1, 1 );
		const boxMaterial = new MeshLambertMaterial({ color: 0xFFFFFF });
		for ( let i = 0; i < 400; i ++ ) {
			const box = new Mesh( boxGeometry, boxMaterial );
			box.position.x = Math.floor( Math.random() * 5 - 5 ) * 5;
			box.position.y = Math.floor( Math.random() * 5 - 5 ) * 5;
			box.position.z = Math.floor( Math.random() * 5 ) * 5 + 0.5;
			this.root.add( box );
		}
		return this.root;
	}
}

export default TestArea;
