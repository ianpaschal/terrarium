import { Vector3, Geometry, LineSegments, LineBasicMaterial } from "three";

class VoxelCursor {
	constructor() {
		// Cursor lines:
		const segments = [
			new Vector3( -0.01, -0.01, -0.01 ), new Vector3( 0.125, -0.01, -0.01 ),
			new Vector3( -0.01, -0.01, -0.01 ), new Vector3( -0.01, 0.125, -0.01 ),
			new Vector3( -0.01, -0.01, -0.01 ), new Vector3( -0.01, -0.01, 0.125 ),

			new Vector3( 1.01, -0.01, -0.01 ), new Vector3( 0.875, -0.01, -0.01 ),
			new Vector3( 1.01, -0.01, -0.01 ), new Vector3( 1.01, 0.125, -0.01 ),
			new Vector3( 1.01, -0.01, -0.01 ), new Vector3( 1.01, -0.01, 0.125 ),

			new Vector3( -0.01, 1.01, -0.01 ), new Vector3( 0.125, 1.01, -0.01 ),
			new Vector3( -0.01, 1.01, -0.01 ), new Vector3( -0.01, 0.875, -0.01 ),
			new Vector3( -0.01, 1.01, -0.01 ), new Vector3( -0.01, 1.01, 0.125 ),

			new Vector3( 1.01, 1.01, -0.01 ), new Vector3( 0.875, 1.01, -0.01 ),
			new Vector3( 1.01, 1.01, -0.01 ), new Vector3( 1.01, 0.875, -0.01 ),
			new Vector3( 1.01, 1.01, -0.01 ), new Vector3( 1.01, 1.01, 0.125 ),

			new Vector3( -0.01, -0.01, 1.01 ), new Vector3( 0.125, -0.01, 1.01 ),
			new Vector3( -0.01, -0.01, 1.01 ), new Vector3( -0.01, 0.125, 1.01 ),
			new Vector3( -0.01, -0.01, 1.01 ), new Vector3( -0.01, -0.01, 0.875 ),

			new Vector3( 1.01, -0.01, 1.01 ), new Vector3( 0.875, -0.01, 1.01 ),
			new Vector3( 1.01, -0.01, 1.01 ), new Vector3( 1.01, 0.125, 1.01 ),
			new Vector3( 1.01, -0.01, 1.01 ), new Vector3( 1.01, -0.01, 0.875 ),

			new Vector3( -0.01, 1, 1 ), new Vector3( 0.125, 1.01, 1.01 ),
			new Vector3( -0.01, 1, 1 ), new Vector3( -0.01, 0.875, 1.01 ),
			new Vector3( -0.01, 1, 1 ), new Vector3( -0.01, 1.01, 0.875 ),

			new Vector3( 1.01, 1.01, 1.01 ), new Vector3( 0.875, 1.01, 1.01 ),
			new Vector3( 1.01, 1.01, 1.01 ), new Vector3( 1.01, 0.875, 1.01 ),
			new Vector3( 1.01, 1.01, 1.01 ), new Vector3( 1.01, 1.01, 0.875 )
		];
		const cursorGeometry = new Geometry();
		cursorGeometry.vertices = segments;
		this.cursor = new LineSegments(
			cursorGeometry,
			new LineBasicMaterial( 0xffffff )
		);
		this.cursor.name = "cursor";
		this.cursor.direction = new Vector3();

		return this.cursor;
	}
}

export default VoxelCursor;