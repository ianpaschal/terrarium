// Voxeland is distributed under the MIT license.

import { Fog, Scene } from "three";
import DaylightSystem from "./DaylightSystem";
import TestArea from "./TestArea";

class World {

	constructor() {
		this.generator = 0;

		this.scene = new Scene();
		this.scene.fog = new Fog( 0xffffff, 0, 512 );
		this.scene.add( new DaylightSystem() );

		this.terrain = new TestArea();
		this.scene.add( this.terrain );
	}
}
export default World;
