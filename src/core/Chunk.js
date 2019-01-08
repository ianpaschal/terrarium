// Terrarium is distributed under the MIT license.

import {
	Box3,
	BufferGeometry,
	Float32BufferAttribute,
	LinearMipMapLinearFilter,
	Mesh,
	MeshLambertMaterial,
	MeshNormalMaterial,
	NearestFilter,
	TextureLoader,
	Vector3,
} from "three";

// Globals
const CHUNK_SIZE = 16;
const VOXEL_COUNT = Math.pow( CHUNK_SIZE, 3 ); // 4096

const GLOBAL_MATERIALS = [];
const LOADER = new TextureLoader();

const TEXTURE_SOURCES = [
	"../resources/textures/grass_side.png",
	"../resources/textures/grass_top.png",
	"../resources/textures/dirt.png",
	"../resources/textures/cobble_stone.png"
];

TEXTURE_SOURCES.forEach( ( file ) => {
	const texture = LOADER.load( file );
	texture.magFilter = NearestFilter;
	texture.minFilter = LinearMipMapLinearFilter;
	GLOBAL_MATERIALS.push( new MeshLambertMaterial({
		color: 0xFFFFFF,
		map: texture
	}) );
});

class Chunk {

	constructor( position, voxelValues ) {

		// Length is always 4913 (17 x 17 x 17)
		// The chunk mesh is only 16 x 16 x 16 but by including an extra row, we can generate the
		// geometry far easier because we know what the first row of the next chunk will be
		this.voxelValues = voxelValues;

		// Chunk coordinates:
		this.position = position;

		// Physical bounds within world
		this.bounds = new Box3( this.position, new Vector3(
			this.position.x + CHUNK_SIZE,
			this.position.y + CHUNK_SIZE,
			this.position.z + CHUNK_SIZE
		) );
	}

	/**
	 * Get the position of the voxel with the given index.
	 * @param {Number} i - Index of voxel
	 */
	getVoxelLocation( i ) {
		if ( i < 0 || i >= VOXEL_COUNT ) {
			console.warn( "Voxel index out of bounds, cannot convert to location" );
			return null;
		}
		const x = Math.floor( i / Math.pow( CHUNK_SIZE + 1, 2 ) );
		const y = Math.floor( ( i - x * Math.pow( CHUNK_SIZE + 1, 2 ) ) / ( CHUNK_SIZE + 1 ) );
		const z = i % ( CHUNK_SIZE + 1 );
		return new Vector3( x, y, z );
	}

	/**
	 * Get the index of the voxel at the given position.
	 * @param {Vector3} vector - Vector within the chunk
	 */
	getVoxelIndex( v ) {
		// if ( v.x < 0 || v.x > 15 || v.y < 0 || v.y > 15 || v.z < 0 || v.z > 15 ) {
		// 	console.warn( "Voxel vector out of bounds, cannot convert to index" );
		// 	return null;
		// }

		// Use CHUNK_SIZE + 1 because we're searching the raw 17x17x17 array
		const x = v.x * Math.pow( CHUNK_SIZE + 1, 2 );
		const y = v.y * ( CHUNK_SIZE + 1 );
		const z = v.z;
		return x + y + z;
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

	updateMesh() {
		this.geometry = this.generateGeometry();
		this.material = new MeshNormalMaterial();

		if ( this.mesh ) {
			this.mesh.geometry = this.geometry;
			this.mesh.material = this.material;
			this.mesh.geometry.needsUpdate = true;
		} else {
			this.mesh = new Mesh( this.geometry, this.material );
		}
		this.mesh.position.copy( this.position );
	}

	// /**
	//  * Check if a voxel's neighbor from a given location and direction is solid or not
	//  * @param {*} location
	//  * @param {*} direction
	//  */
	// getContactValue( location, direction ) {
	// 	// TODO: Error handling if direction is negative or location isn't on edge

	// 	let i;
	// 	if ( direction.x === 1 ) {
	// 		i = location.z + location.y * CHUNK_SIZE;
	// 		return this.contactMap.x[ i ];
	// 	}
	// 	if ( direction.y === 1 ) {
	// 		i = location.z + location.x * CHUNK_SIZE;
	// 		return this.contactMap.y[ i ];
	// 	}
	// 	if ( direction.z === 1 ) {
	// 		i = location.z + location.x * CHUNK_SIZE;
	// 		return this.contactMap.y[ i ];
	// 	}
	// }

	/**
	 * Generate the chunk geometry
	 */
	generateGeometry() {

		// Use these for some DRY-loops
		const axes = [ "x", "y", "z" ];

		const positions = [];
		const normals = [];
		const faceIndices = [];

		/**
		 * Rather than check six sides of each voxel, we check only the positive direction in each
		 * of 3 axes.
		 * There are two execptions:
		 * If any axis value is 0 and we need to check the negative direction
		 * If any axis value is 15, we need to check the neighboring chunk
		 */

		// This is a helper function for generating faces on the buffer geometry
		// It pushes stuff to the arrays defined at the beginning of generateGeometry()
		function addFaceToGeometry( location, direction ) {

			// Add x, y, and z values from the direction vector 4 times
			for ( let i = 0; i < 4; i++ ) {
				axes.forEach( ( axis ) => {
					normals.push( direction[ axis ] );
				});
			}

			/*
			Create them counter-clockwise (normal wrapping order)
			A, B, C and A, C, D
			B -- A
			|   /|
			|  / |
			| /  |
			C -- D
			*/

			const corners = computeVertices( location, direction );

			for ( let i = 0; i < corners.length; i++ ) {
				positions.push( corners[ i ] );
			}

			const numVertices = positions.length / 3;

			const a = numVertices - 4;
			const b = numVertices - 3;
			const c = numVertices - 2;
			const d = numVertices - 1;

			faceIndices.push( a, b, c );
			faceIndices.push( a, c, d );

		}

		// For each voxel in the chunk...
		for ( let x = 0; x < CHUNK_SIZE; x++ ) {
			for ( let y = 0; y < CHUNK_SIZE; y++ ) {
				for ( let z = 0; z < CHUNK_SIZE; z++ ) {

					const position = new Vector3( x, y, z );

					const i = this.getVoxelIndex( position );

					// For each neighbor (north, east, top)...
					axes.forEach( ( axis ) => {

						// Compute the neighbor location to check
						const direction = new Vector3();
						direction[ axis ] += 1;

						const neighborPosition = position.clone().add( direction );

						const j = this.getVoxelIndex( neighborPosition );

						// // If check location is in the next chunk
						// if ( checkLocation[ axis ] === CHUNK_SIZE ) {

						// 	// If neighbor is not solid, and this block is
						// 	if ( !this.getContactValue( location, direction ) ) {
						// 		if ( this.voxelValues[ i ] !== 0 ) {
						// 			// Generate a face for that axis with positive normals
						// 			addFaceToGeometry( location, direction );
						// 			return;
						// 		}
						// 	}
						// }

						// If this voxel is solid and the neighbor is not, generate a face
						if ( this.voxelValues[ i ] !== 0 && this.voxelValues[ j ] === 0 ) {

							// Generate a face for that axis with positive normals
							addFaceToGeometry( position, direction );
							return;
						}
						// If this voxel is air and the neighbor is not, generate a backwards face
						if ( this.voxelValues[ i ] === 0 && this.voxelValues[ j ] !== 0 ) {

							// Generate a face for that axis with negative (backwards) normals
							addFaceToGeometry( neighborPosition, direction.negate() );
							return;
						}
					});
				}
			}
		}

		// Create an empty buffer geometry
		const geometry = new BufferGeometry();
		geometry.setIndex( faceIndices );
		geometry.addAttribute( "position", new Float32BufferAttribute( positions, 3 ) );
		geometry.addAttribute( "normal", new Float32BufferAttribute( normals, 3 ) );

		return geometry;
	}

	/**
	 * Set a new value for a voxel at a given index, and update the mesh around
	 * around that voxel.
	 * @param {Number} i
	 * @param {Number} value
	 */
	setVoxelData( i, value ) {
		this.voxelValues[ i ] = value;
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

// /**
//  *
//  * @param {Geometry} geometry - The geometry to search through
//  * @param {Vector3} location - The location to check
//  * @returns {Number} - The index of the matching vertex
//  */
// function findIndexByVector( geometry, location ) {
// 	let vertex;

// 	// 'for' loop is used here for performance reasons
// 	for ( let i = 0, length = geometry.vertices.length; i < length; i++ ) {
// 		vertex = geometry.vertices[ i ];

// 		// The Three.js .equals() method is simply a triple comparison for x,y,z
// 		if ( vertex.equals( location ) ) {

// 			// Return the index (we already know the location of that vertex anyway)
// 			return geometry.vertices.indexOf( vertex );
// 		}
// 	}
// 	return -1;
// }

/**
 * @description Compute vertices for a single face of a voxel
 * @param {*} p
 * @param {*} d
 */
function computeVertices( p, d ) {

	// Since chunks use buffer geometry, so vectors should be an array of 12 floats
	const vectors = [];

	// TODO: Make this more algorithmic/DRY

	// "East"
	if ( d.x === 1 ) {
		vectors.push(
			p.x + 1, p.y + 1, p.z + 1,
			p.x + 1, p.y,     p.z + 1,
			p.x + 1, p.y,     p.z,
			p.x + 1, p.y + 1, p.z
		);
		return vectors;
	}

	// "North"
	if ( d.y === 1 ) {
		vectors.push(
			p.x,     p.y + 1, p.z + 1,
			p.x + 1, p.y + 1, p.z + 1,
			p.x + 1, p.y + 1, p.z,
			p.x,     p.y + 1, p.z
		);
		return vectors;
	}

	// "Up"
	if ( d.z === 1 ) {
		vectors.push(
			p.x + 1, p.y + 1, p.z + 1,
			p.x,     p.y + 1, p.z + 1,
			p.x,     p.y,     p.z + 1,
			p.x + 1, p.y,     p.z + 1
		);
		return vectors;
	}

	// "West"
	if ( d.x === -1 ) {
		vectors.push(
			p.x,     p.y,     p.z + 1,
			p.x,     p.y + 1, p.z + 1,
			p.x,     p.y + 1, p.z,
			p.x,     p.y,     p.z
		);
		return vectors;
	}

	// "South"
	if ( d.y === -1 ) {
		vectors.push(
			p.x + 1, p.y,     p.z + 1,
			p.x,     p.y,     p.z + 1,
			p.x,     p.y,     p.z,
			p.x + 1, p.y,     p.z
		);
		return vectors;
	}

	// "Bottom"
	if ( d.z === -1 ) {
		vectors.push(
			p.x,     p.y,     p.z,
			p.x,     p.y + 1, p.z,
			p.x + 1, p.y + 1, p.z,
			p.x + 1, p.y,     p.z
		);
		return vectors;
	}
}

// /**
//  * This extends a given geometry with new faces for a given voxel location and direction
//  * @param {*} geometry - The geometry to copy and extend
//  * @param {*} location
//  * @param {*} direction
//  * @returns {BufferGeometry} - The extended geometry
//  */
// function addFaceToGeometry( location, direction ) {

// 	/*
// 	Create them counter-clockwise (normal wrapping order)
// 	A, B, C and A, C, D
// 	B ----- A
// 	|    /  |
// 	|   /   |
// 	|  /    |
// 	C ----- D
// 	*/

// 	const corners = computeVertices( location, direction );

// 	const indices = [];

// 	// Try to re-use existing vectors. If a vector with the right position
// 	// is found, use that, otherwise push the vector to the geometry and
// 	// use its index for the face
// 	corners.forEach( ( triplet ) => {
// 		const index = findIndexByVector( geometry, triplet );
// 		if ( index >= 0 ) {
// 			indices.push( index );
// 		} else {
// 			const length = geometry.vertices.push( triplet );
// 			indices.push( length - 1 );
// 		}
// 	});

// 	// Create the faces
// 	const faceA = new Face3( indices[ 0 ], indices[ 1 ], indices[ 2 ] );
// 	const faceB = new Face3( indices[ 0 ], indices[ 2 ], indices[ 3 ] );

// 	// faceA.voxelPosition = this.getVoxelLocation( index ).add( this.position );
// 	// faceB.voxelPosition = this.getVoxelLocation( index ).add( this.position );

// 	// // Assign material
// 	// switch( this.voxelValues[ index ] ) {
// 	// 	// Grass
// 	// 	case 1:
// 	// 		if (
// 	// 			direction.equals( new Vector3( 1, 0, 0 ) ) ||
// 	// 				direction.equals( new Vector3( 0, 1, 0 ) ) ||
// 	// 				direction.equals( new Vector3( -1, 0, 0 ) ) ||
// 	// 				direction.equals( new Vector3( 0, -1, 0 ) )
// 	// 		) {
// 	// 			faceA.materialIndex = 0;
// 	// 			faceB.materialIndex = 0;
// 	// 		}

// 	// 		if ( direction.equals( new Vector3( 0, 0, 1 ) ) ) {
// 	// 			faceA.materialIndex = 1;
// 	// 			faceB.materialIndex = 1;
// 	// 		}
// 	// 		if ( direction.equals( new Vector3( 0, 0, -1 ) ) ) {
// 	// 			faceA.materialIndex = 2;
// 	// 			faceB.materialIndex = 2;
// 	// 		}
// 	// 		break;
// 	// 	case 2:
// 	// 		faceA.materialIndex = 3;
// 	// 		faceB.materialIndex = 3;
// 	// 		break;
// 	// 	default:
// 	// 		faceA.materialIndex = 3;
// 	// 		faceB.materialIndex = 3;
// 	// }

// 	// Add the face to the geometry's faces array
// 	this.geometry.faces.push( faceA, faceB );
// 	this.geometry.faceVertexUvs.push( [] );
// 	this.geometry.faceVertexUvs[ 0 ].push( [
// 		new Vector2( 0, 1 ),
// 		new Vector2( 1, 1 ),
// 		new Vector2( 1, 0 )
// 	] );
// 	this.geometry.faceVertexUvs[ 0 ].push( [
// 		new Vector2( 0, 1 ),
// 		new Vector2( 1, 0 ),
// 		new Vector2( 0, 0 )
// 	] );
// 	this.geometry.computeFaceNormals();
// }
