// Voxeland is distributed under the MIT license.

import {
	Box3, BoxGeometry, Face3, Geometry, Mesh, MeshLambertMaterial, Object3D,
	Vector2,
	Vector3, TextureLoader } from "three";
class Chunk {

	constructor( position, blockIndices ) {

		// Length is always 4096 (16 x 16 x 16)
		this.blockIndices = blockIndices;

		this.position = position;

		this.bounds = new Box3( this.position, new Vector3(
			this.position.x + 16,
			this.position.y + 16,
			this.position.z + 16
		) );

		// this.mesh = new Object3D();
		this.generateMesh();
	}

	/**
	 * Get the position of the block with the given index.
	 * @param {Number} i - Index of block
	 */
	getBlockLocation( i ) {
		if ( i < 0 || i > 4095 ) {
			console.warn( "Block index out of bounds, cannot convert to location" );
			return null;
		}
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
		if ( this.bounds.containsPoint( vector ) === false ) {
			console.warn( "Block vector out of bounds, cannot convert to index" );
			return null;
		}
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

		console.log( "Generating mesh" );
		this.geometry = new Geometry();
		this.material = new MeshLambertMaterial({
			color: 0xFFFF00,
			map: new TextureLoader().load( "src/block.png" )
		});
		// For every block, check each side. if side is air, generate a face on that side

		// TODO: If all air or all solid, skip it

		for ( let i = 0; i < this.blockIndices.length; i++ ) {

			// If block is air, skip it
			if ( this.blockIndices[ i ] === 0 ) {
				continue;
			}

			const loc = this.getBlockLocation( i );

			// const geometry = new BoxGeometry( 1, 1, 1 );
			// const cube = new Mesh( geometry, this.material );
			// cube.position.x = loc.x + 0.5;
			// cube.position.y = loc.y + 0.5;
			// cube.position.z = loc.z + 0.5;

			// This is cleaner than doing math because you need to check where this
			// block is within the stack. Doing the below logic with an equation just
			// duplicates the same logic as in the getBlockLocation method and that's
			// not very DRY.
			const neighbors = {
				east:   this.findAdjacentBlock( i, new Vector3( 1, 0, 0 ) ),
				west:   this.findAdjacentBlock( i, new Vector3( -1, 0, 0 ) ),
				north:  this.findAdjacentBlock( i, new Vector3( 0, 1, 0 ) ),
				south:  this.findAdjacentBlock( i, new Vector3( 0, -1, 0 ) ),
				top:    this.findAdjacentBlock( i, new Vector3( 0, 0, 1 ) ),
				bottom: this.findAdjacentBlock( i, new Vector3( 0, 0, -1 ) )
			};

			for ( const key in neighbors ) {
				if ( neighbors.hasOwnProperty( key ) ) {
					if ( neighbors[ key ] !== 1 ) {
						this.generateFace( i, key );
					}
				}
			}
		}
		this.mesh = new Mesh( this.geometry, this.material );
	}

	findAdjacentBlock( i, direction ) {
		const offset = direction.clone();

		// TODO: Validate vector as unit vector and having only 1 axis
		// offset.normalize();

		const location = this.getBlockLocation( i );
		const neighbor = this.getBlockIndex( location.add( offset ) );
		return this.blockIndices[ neighbor ];
	}

	generateFace( position, face ) {
		const p = new Vector3();
		p.copy( this.getBlockLocation( position ) );

		// 	// Check if position is a Vector3, index, or neither
		// 	if ( position instanceof Vector3 ) {

		// 		// Ensure vector is within the chunk bounds
		// 		if ( !this.bounds.containsPoint( position ) ) {
		// 			console.warn( "Vector was out of bounds!" );
		// 			return;
		// 		}

		// 		p.copy( position );
		// 	} else if ( typeof position === "number" ) {

		// 		// Ensure the index is within the block indices
		// 		if ( position < 0 || position > 4095 ) {
		// 			console.warn( "Index was out of bounds!" );
		// 			return;
		// 		}

		// 		// If it is valid, replace the Number with a Vector3
		// 		p.copy( this.getBlockLocation( position ) );
		// 	} else {
		// 		console.warn( "Invalid face position!" );
		// 		return;
		// 	}

		// 	// for each vertex, check if it already exists. slow but better than adding
		// 	// every vertex preemtively and removing, or leaving, or trying to weld later

		// Create four vertices

		/*
			Create them counter-clockwise (normal wrapping order)
			A, B, C; A, C, D
			B ----- A
			|    /  |
			|   /   |
			|  /    |
			C ----- D
		*/
		let a;
		let b;
		let c;
		let d;
		switch( face ) {
			case "north":
				a = new Vector3( p.x,     p.y + 1, p.z + 1 );
				b = new Vector3( p.x + 1, p.y + 1, p.z + 1 );
				c = new Vector3( p.x + 1, p.y + 1, p.z     );
				d = new Vector3( p.x,     p.y + 1, p.z     );
				break;
			case "south":
				a = new Vector3( p.x + 1, p.y,     p.z + 1 );
				b = new Vector3( p.x,     p.y,     p.z + 1 );
				c = new Vector3( p.x,     p.y,     p.z     );
				d = new Vector3( p.x + 1, p.y,     p.z     );
				break;
			case "west":
				a = new Vector3( p.x,     p.y,     p.z + 1 );
				b = new Vector3( p.x,     p.y + 1, p.z + 1 );
				c = new Vector3( p.x,     p.y + 1, p.z     );
				d = new Vector3( p.x,     p.y,     p.z     );
				break;
			case "east":
				a = new Vector3( p.x + 1, p.y + 1, p.z + 1 );
				b = new Vector3( p.x + 1, p.y,     p.z + 1 );
				c = new Vector3( p.x + 1, p.y,     p.z     );
				d = new Vector3( p.x + 1, p.y + 1, p.z     );
				break;
			case "top":
				a = new Vector3( p.x + 1, p.y + 1, p.z + 1 );
				b = new Vector3( p.x,     p.y + 1, p.z + 1 );
				c = new Vector3( p.x,     p.y,     p.z + 1 );
				d = new Vector3( p.x + 1, p.y,     p.z + 1 );
				break;
			case "bottom":
				a = new Vector3( p.x,     p.y,     p.z     );
				b = new Vector3( p.x,     p.y + 1, p.z     );
				c = new Vector3( p.x + 1, p.y + 1, p.z     );
				d = new Vector3( p.x + 1, p.y,     p.z     );
				break;
		}
		// TODO: Check if any exists
		// Find. if found, use that index. if not, push, and return length - 1

		// Add vertices to mesh
		const length = this.geometry.vertices.push( a, b, c, d );

		const iD = length - 1;
		const iC = length - 2;
		const iB = length - 3;
		const iA = length - 4;

		// Add the face to the geometry's faces array
		this.geometry.faces.push(
			new Face3( iA, iB, iC ),
			new Face3( iA, iC, iD )
		);
		this.geometry.faceVertexUvs.push( [] );
		this.geometry.faceVertexUvs[ 0 ].push( [
			new Vector2( 1, 0 ),
			new Vector2( 0, 0 ),
			new Vector2( 0, 1 )
		] );
		this.geometry.faceVertexUvs[ 0 ].push( [
			new Vector2( 1, 0 ),
			new Vector2( 0, 1 ),
			new Vector2( 1, 1 )
		] );
		this.geometry.computeFaceNormals();
		this.geometry.computeVertexNormals();
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
