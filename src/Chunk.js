import { Geometry, Mesh, MeshLambertMaterial, Vector3 } from "three";
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
	 * Get the index of the vertex at the given position.
	 * @param {Vector3} vector - Vector within the chunk
	 */
	getVertexIndex( vector ) {
		return this.geometry.vertices.find( ( vertex ) => {
			return vertex.equals( vector );
		});
	}

	/**
	 * Regenerate the chunk mesh (destroys existing and replaces).
	 */
	generateMesh() {

		// For every block, check each side. if side is air, generate a face on that side

		for ( let i = 0; i < this.blocks.length; i++ ) {

			// If block is air, skip it
			if ( this.blocks[ i ] === 0 ) {
				continue;
			}

			const loc = this.getBlockLocation( i );

			const neighbors = {
				west: this.getBlockIndex( loc.x - 1, loc.y, loc.z ),
				east: this.getBlockIndex( loc.x + 1, loc.y, loc.z ),
				above: this.getBlockIndex( loc.x, loc.y, loc.z + 1 ),
				below: this.getBlockIndex( loc.x, loc.y, loc.z - 1 ),
				north: this.getBlockIndex( loc.x, loc.y + 1, loc.z ),
				south: this.getBlockIndex( loc.x, loc.y - 1, loc.z )
			};

			for ( const key of neighbors ) {
				if ( this.blocks[ neighbors[ key ] ] === 0 ) {
					// Generate the cooresponding face for that key

				}
			}
		}

		this.object3D = new Mesh();
	}

	generateGeometry( i, face ) {

		// for each vertex, check if it already exists. slow but better than adding
		// every vertex preemtively and removing, or leaving, or trying to weld later

		switch( face ) {
			case "north":
				break;
			case "south":
				break;
			case "north":
				break;
			case "south":
				break;
			case "north":
				break;
			case "south":
				break;
		}
	}

	weldVertices( geometry, tolerance ) {

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
