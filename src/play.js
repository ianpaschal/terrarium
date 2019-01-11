// Terrarium is distributed under the MIT license.

import { PerspectiveCamera, WebGLRenderer } from "three";
import PlayerController from "./controls/PlayerController";
import scene from "./scene";
import { ipcRenderer } from "electron";

let camera;
let renderer;
let player;

let prevTime = performance.now();

function init() {
	camera = new PerspectiveCamera(
		75, window.innerWidth / window.innerHeight, 0.01, 1000
	);

	// Hack until entities are worked out
	player = new PlayerController( camera ); // TODO: Attach separately
	player.spawn();

	renderer = new WebGLRenderer({
		antialias: false // for performance gain
	});
	// renderer.setPixelRatio( window.devicePixelRatio ); // For performance gain
	renderer.setPixelRatio( 1 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0xFFFFFF );
	document.body.appendChild( renderer.domElement );
	window.addEventListener( "resize", onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {

	// Move to player
	if ( player.enabled ) {
		const time = performance.now();
		const delta = ( time - prevTime );
		prevTime = time;
		ipcRenderer.send( "tick", delta );
	}

	// Render
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

init();
animate();

ipcRenderer.on( "state", ( e, data ) => {
	console.log( "got data", data );
});
