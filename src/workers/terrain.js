// All chunk instances live here.
// The terrain system sends update messages here, and recieves back updated geometry

self.addEventListener( "updateVoxel", ( e ) => {
	const { x, y, z, value } = e;

	self.postMessage( e.data );
}, false );

self.addEventListener( "message", ( e ) => {
	self.postMessage( e.data );
}, false );

function generateGeometry() {

}
