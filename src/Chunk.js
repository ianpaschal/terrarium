import { Vector3 } from "three";
class Chunk {

	constructor( data ) {
		this.data = data;

		// Length is always 4096 (16 x 16 x 16)
		this.blockIndices = [];
	}

	/**
	 * Get the position of the block with the given index.
	 * @param {Number} i - Index of block
	 */
	getBlockLocation( i ) {
		const x = Math.floor( i / 256 );
		const y = Math.floor( ( i - x * 256 ) / 16 );
		const z = i % 16;
		return new Vector3( x, y, z );
	}

	/**
	 * Get the index of the block at the given position.
	 * @param {Vector3} vector - Vector within the chunk
	 */
	getBlockIndex( vector ) {
		return vector.x * 256 + vector.y * 16 + vector.z;
	}

	/**
	 * Regenerate the chunk mesh (destroys existing and replaces).
	 */
	generateMesh() {

	}

	/**
	 * Set a new value for a block at a given index, and update the mesh around
	 * around that block.
	 * @param {Number} i
	 * @param {Number} value
	 */
	updateMesh( i, value ) {

	}
}

export default Chunk;

/*
Chunk testing
const x = 7;
const y = 12;
const z = 2;
const i = x * 256 + y * 16 + z;

console.log( "x:" + x + ", y:" + y + ", z:" + z + " ->", i );

const compX = Math.floor( i / 256 );
const compY = Math.floor(( i - compX * 256 ) / 16);
const compZ = i % 16;

console.log( "x:", compX );
console.log( "y:", compY );
console.log( "z:", compZ );
*/
