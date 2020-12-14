// Terrarium is distributed under the MIT license.

import { Vector3, Box3 } from "three";
import { System, Entity } from "aurora";
import SimplexNoise from "simplex-noise";

// Globals
const CHUNK_SIZE = 16;
const VOXEL_COUNT = Math.pow( CHUNK_SIZE, 3 ); // 4096
const VOXEL_SIZE = 1;
const RESOLUTION = CHUNK_SIZE / VOXEL_SIZE;

/**
 * This system is soley responsible for generating new voxel data for the world. It does not handle
 * mesh generation or loading and unloading data.
 */
export default new System({
	name: "terrain-generation",

	// TODO: Add conditional component types so we can add the player for location-based generation
	componentTypes: [
		"voxel-data",
		"buffer-geometry",
		"position",
	],
	methods: {
		buildGeometry( voxelValues ) {

			// Use these for some DRY-loops
			const axes = [ "x", "y", "z" ];

			const positions = [];
			const normals = []; // Length should match positions length
			const uvs = []; // Length should match positions length

			const faceIndices = [];

			/**
			 * Rather than check six sides of each voxel, we check only the positive direction in
			 * each of 3 axes.
			 * There are two execptions:
			 * If any axis value is 0 and we need to check the negative direction
			 * If any axis value is 15, we need to check the neighboring chunk
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

				uvs.push( 0, 1, 1, 1, 1, 0, 0, 0 );
			}

			// For each voxel in the chunk...
			for ( let x = 0; x < CHUNK_SIZE; x++ ) {
				for ( let y = 0; y < CHUNK_SIZE; y++ ) {
					for ( let z = 0; z < CHUNK_SIZE; z++ ) {

						const position = new Vector3( x, y, z );

						const i = this.dispatch( "getVoxelIndex", position );

						// For each neighbor (north, east, top)...
						axes.forEach( ( axis ) => {

						// Compute the neighbor location to check
							const direction = new Vector3();
							direction[ axis ] += 1;

							const neighborPosition = position.clone().add( direction );

							const j = this.dispatch( "getVoxelIndex", neighborPosition );

							// If this voxel is solid and the neighbor is not, generate a face
							if ( voxelValues[ i ] !== 0 && voxelValues[ j ] === 0 ) {

							// Generate a face for that axis with positive normals
								addFaceToGeometry( position, direction );
								return;
							}
							// If this voxel is air and the neighbor is not
							// generate a backwards face
							if ( voxelValues[ i ] === 0 && voxelValues[ j ] !== 0 ) {

							// Generate a face for that axis with negative (backwards) normals
								addFaceToGeometry( neighborPosition, direction.negate() );
								return;
							}
						});
					}
				}
			}

			return {
				index: faceIndices,
				position: positions,
				normal: normals,
				uv: uvs
			};
		},
		createChunk( position ) {
			// The chunk mesh is only 16 x 16 x 16 but by including an extra row, we can
			// generate the geometry far easier because we know what the first row of the next
			// chunk will be
			let voxelData = [];

			if ( position.z !== 0 ) {
				return;
			}

			// Fill chunk in columns based on elevation
			for ( let x = 0; x <= CHUNK_SIZE; x++ ) {
				for ( let y = 0; y <= CHUNK_SIZE; y++ ) {
					const elevation = Math.round( this.generator.noise2D(
						( position.x + x ) / this.scale,
						( position.y + y ) / this.scale
					) * ( CHUNK_SIZE / 2 ) ) + ( CHUNK_SIZE / 2 );
					const column = [ 1 ];
					for ( let z = 1; z < elevation; z++ ) {
						column.push( 1 );
					}
					while ( column.length <= CHUNK_SIZE ) {
						column.push( 0 );
					}
					voxelData = voxelData.concat( column );
				}
			}

			const chunk = new Entity({
				type: "terrain-chunk",
				components: [
					{
						type: "voxel-data",
						data: voxelData
					},
					{
						type: "position",
						data: position
					},
					{
						type: "buffer-geometry",
						data: this.dispatch( "buildGeometry", voxelData )
					}
				]
			});

			this.chunks.push( chunk );

			// Now create a chunk with the data:
			this._engine.addEntity( chunk );

			return chunk;
		},
		/**
		 * Get the position of the voxel with the given index.
		 * @param {Number} i - Index of voxel
		 */
		getVoxelPosition( i ) {
			if ( i < 0 || i >= VOXEL_COUNT ) {
				console.warn( "Voxel index out of bounds, cannot convert to location" );
				return null;
			}
			const x = Math.floor( i / Math.pow( CHUNK_SIZE + 1, 2 ) );
			const y = Math.floor( ( i - x * Math.pow( CHUNK_SIZE + 1, 2 ) ) / ( CHUNK_SIZE + 1 ) );
			const z = i % ( CHUNK_SIZE + 1 );
			return new Vector3( x, y, z );
		},
		/**
		 * Get the index of the voxel at the given position.
		 * @param {Vector3} vector - Vector within the chunk
		 */
		getVoxelIndex( v ) {
			if ( v.x < 0 || v.x > 16 || v.y < 0 || v.y > 16 || v.z < 0 || v.z > 16 ) {
				console.warn( "Voxel vector out of bounds, cannot convert to index" );
				return null;
			}

			// Use CHUNK_SIZE + 1 because we're searching the raw 17x17x17 array
			const x = v.x * Math.pow( CHUNK_SIZE + 1, 2 );
			const y = v.y * ( CHUNK_SIZE + 1 );
			const z = v.z;
			return x + y + z;
		}
	},
	onInit() {

		// Create the generator
		this.generator = new SimplexNoise();
		this.scale = 64;

		// Store chunks here
		this.chunks = [];

		this.players = [];

		// Generate the beginning of the world
		const worldSize = 2;
		for ( let chunkX = worldSize / -2; chunkX < worldSize / 2; chunkX++ ) {
			for ( let chunkY = worldSize / -2; chunkY < worldSize / 2; chunkY++ ) {
				this.dispatch( "createChunk", {
					x: chunkX * 16,
					y: chunkY * 16,
					z: 0
				});
			}
		}
	},
	onUpdate() {
		if ( !this.players[ 0 ] ) {
			const uuid = this._engine.getSystem( "movement" ).dispatch( "getPlayerUUID" );
			this.players[ 0 ] = this._engine.getEntity( uuid );
		}
		
		if ( this.players[ 0 ].dirty ) {
			const playerData = this.players[ 0 ].getComponentData( "position" );
			const playerChunk = new Vector3(
				Math.floor( playerData.x / 16 ) * 16,
				Math.floor( playerData.y / 16 ) * 16,
				Math.floor( playerData.z / 16 ) * 16
			);
			const min = new Vector3(
				playerChunk.x - CHUNK_SIZE * 2,
				playerChunk.y - CHUNK_SIZE * 2,
				playerChunk.z - CHUNK_SIZE * 2
			);
			const max = new Vector3(
				playerChunk.x + CHUNK_SIZE * 2,
				playerChunk.y + CHUNK_SIZE * 2,
				playerChunk.z + CHUNK_SIZE * 2
			);

			// Create a list of required positions
			const positions = [];
			for ( let x = min.x; x <= max.x; x += CHUNK_SIZE ) {
				for ( let y = min.y; y <= max.y; y += CHUNK_SIZE ) {
					for ( let z = min.z; z <= max.z; z += CHUNK_SIZE ) {
						positions.push( new Vector3( x, y, z ) );
					}
				}
			}
			// console.log( "positions pre trim:", positions.length );

			// create an array of required chunk positions
			// cycle through chunks. for each one if its position is in required, keep it
			// if it's not, destroy it
			// take the remaining positions array and generate new chunks for those
			this.chunks.forEach( ( chunk ) => {
				const positionData = chunk.getComponentData( "position" );
				const chunkPosition = new Vector3(
					positionData.x,
					positionData.y,
					positionData.z
				);
				const match = positions.find( ( position ) => {
					return position.equals( chunkPosition );
				});
				if ( !match ) {
					this._engine.getEntity( chunk.uuid ).destroy = true;
					console.log( this._engine.getEntity( chunk.uuid ) );
					const i = this.chunks.indexOf( chunk );
					this.chunks.splice( i, 1 );
				} else {
					const i = positions.indexOf( match );
					positions.splice( i, 1 );
				}
			});

			// console.log( "positions post trim:", positions.length );

			// For any remaining required positions, create a chunk
			positions.forEach( ( position ) => {
				this.dispatch( "createChunk", {
					x: position.x,
					y: position.y,
					z: position.z
				});
			});

			// // get current chunk
			// const currentChunk = this.chunks.find( ( chunk ) => {
			// 	const chunkPosition = new Vector3();
			// 	const positionData = chunk.getComponentData( "position" );
			// 	chunkPosition.set(
			// 		positionData.x,
			// 		positionData.y,
			// 		positionData.z
			// 	);
			// 	return chunkPosition.equals( playerChunk );
			// });
			// if ( !currentChunk ) {
			// 	this.dispatch( "createChunk", {
			// 		x: playerChunk.x,
			// 		y: playerChunk.y,
			// 		z: playerChunk.z
			// 	});
			// }
		}
	}
});
