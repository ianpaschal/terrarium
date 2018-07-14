import {
	BoxGeometry,
	Mesh,
	MeshLambertMaterial,
	Object3D,
	Vector3
} from "three";
class Player {

	constructor() {
		this.model = new Object3D();
		const material = new MeshLambertMaterial({ color:0xFFFF00 });
		const geometry = new BoxGeometry( 1, 1, 2 );
		const mesh = new Mesh( geometry, material );
		mesh.position.z = 1;
		this.model.add( mesh );
		this.velocity = new Vector3();
		this.acceleration = new Vector3();
		this.offset = 0;
	}
}
export default Player;
