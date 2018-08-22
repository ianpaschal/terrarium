// Terrarium is distributed under the MIT license.
import TestArea from "../world/TestArea";
import SystemLite from "../engine/SystemLite";
import SimplexNoise from "simplex-noise";

const init = function() {
	const terrain = new TestArea();
	this._engine.scene.add( terrain );
	this.generator = new SimplexNoise();
};

const update = function( t ) {
	// Do nothing for now
};

export default new SystemLite( init, update );
