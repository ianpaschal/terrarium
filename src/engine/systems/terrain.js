// Terrarium is distributed under the MIT license.
import TestArea from "../world/TestArea";
import SystemLite from "../SystemLite";
import SimplexNoise from "simplex-noise";

const init = function() {
	const terrain = new TestArea();
	this._engine.scene.add( terrain );
	this.generator = new SimplexNoise();
};

const update = function( t ) {
	// Do nothing for now

	// Check where player is

	// If there is not a chunk for all chunks surrounding, generate it
};

function generateChunkData() {

}

export default new SystemLite( init, update );
