import { BoxGeometry, Mesh, MeshLambertMaterial, Object3D } from "three";
import store from "../store";
const size = 16;
const simplex = store.state.simplex;
class Terrain {
	constructor( chunkX, chunkY ) {
		// TODO: move block material to block object
		const scale = 16;

		const material = new MeshLambertMaterial( 0xCCCCCC );
		this.root = new Object3D();
		this.root.position.set( chunkX * size, chunkY * size, 0 );
		for ( let x = 0; x < size; x++ ) {
			for ( let y = 0; y < size; y++ ) {
				const geometry = new BoxGeometry( 1, 1, 1 );
				const mesh = new Mesh( geometry, material );
				mesh.position.x = x + 0.5;
				mesh.position.y = y + 0.5;
				const value = Math.round( simplex.noise2D(
					( this.root.position.x + x ) / scale,
					( this.root.position.y + y ) / scale
				) * 3 );
				mesh.position.z = value;
				this.root.add( mesh );
			}
		}
		return this.root;
	}
}

export default Terrain;
