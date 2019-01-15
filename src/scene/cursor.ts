import { Vector3, Geometry, LineSegments, LineBasicMaterial } from "three";

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

	new Vector3( -0.01, 1.01, 1.01 ), new Vector3( 0.125, 1.01, 1.01 ),
	new Vector3( -0.01, 1.01, 1.01 ), new Vector3( -0.01, 0.875, 1.01 ),
	new Vector3( -0.01, 1.01, 1.01 ), new Vector3( -0.01, 1.01, 0.875 ),

	new Vector3( 1.01, 1.01, 1.01 ), new Vector3( 0.875, 1.01, 1.01 ),
	new Vector3( 1.01, 1.01, 1.01 ), new Vector3( 1.01, 0.875, 1.01 ),
	new Vector3( 1.01, 1.01, 1.01 ), new Vector3( 1.01, 1.01, 0.875 )
];
const cursorGeometry = new Geometry();
cursorGeometry.vertices = segments;
const cursor = new LineSegments(
	cursorGeometry,
	new LineBasicMaterial({
		color: 0xffffff
	})
);
cursor.name = "cursor";
// @ts-ignore
cursor.direction = new Vector3();

export default cursor;
