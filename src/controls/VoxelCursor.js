import { Vector3, Geometry, LineSegments, LineBasicMaterial } from "three";

class VoxelCursor {
	constructor() {
		// Cursor lines:
		const segments = [
			new Vector3( 0, 0, 0 ), new Vector3( 0.125, 0, 0 ),
			new Vector3( 0, 0, 0 ), new Vector3( 0, 0.125, 0 ),
			new Vector3( 0, 0, 0 ), new Vector3( 0, 0, 0.125 ),

			new Vector3( 1, 0, 0 ), new Vector3( 0.875, 0, 0 ),
			new Vector3( 1, 0, 0 ), new Vector3( 1, 0.125, 0 ),
			new Vector3( 1, 0, 0 ), new Vector3( 1, 0, 0.125 ),

			new Vector3( 0, 1, 0 ), new Vector3( 0.125, 1, 0 ),
			new Vector3( 0, 1, 0 ), new Vector3( 0, 0.875, 0 ),
			new Vector3( 0, 1, 0 ), new Vector3( 0, 1, 0.125 ),

			new Vector3( 1, 1, 0 ), new Vector3( 0.875, 1, 0 ),
			new Vector3( 1, 1, 0 ), new Vector3( 1, 0.875, 0 ),
			new Vector3( 1, 1, 0 ), new Vector3( 1, 1, 0.125 ),

			new Vector3( 0, 0, 1 ), new Vector3( 0.125, 0, 1 ),
			new Vector3( 0, 0, 1 ), new Vector3( 0, 0.125, 1 ),
			new Vector3( 0, 0, 1 ), new Vector3( 0, 0, 0.875 ),

			new Vector3( 1, 0, 1 ), new Vector3( 0.875, 0, 1 ),
			new Vector3( 1, 0, 1 ), new Vector3( 1, 0.125, 1 ),
			new Vector3( 1, 0, 1 ), new Vector3( 1, 0, 0.875 ),

			new Vector3( 0, 1, 1 ), new Vector3( 0.125, 1, 1 ),
			new Vector3( 0, 1, 1 ), new Vector3( 0, 0.875, 1 ),
			new Vector3( 0, 1, 1 ), new Vector3( 0, 1, 0.875 ),

			new Vector3( 1, 1, 1 ), new Vector3( 0.875, 1, 1 ),
			new Vector3( 1, 1, 1 ), new Vector3( 1, 0.875, 1 ),
			new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 0.875 )
		];
		const cursorGeometry = new Geometry();
		cursorGeometry.vertices = segments;
		this.cursor = new LineSegments(
			cursorGeometry,
			new LineBasicMaterial( 0xffffff )
		);
		this.cursor.name = "cursor";

		return this.cursor;
	}
}

export default VoxelCursor;