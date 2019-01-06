// Terrarium is distributed under the MIT license.

import { PerspectiveCamera, WebGLRenderer } from "three";
import Player from "./core/Player";
import engine from "./engine";
import scene from "./scene";

let camera;
let renderer;

let prevTime = performance.now();

function init() {
	camera = new PerspectiveCamera(
		75, window.innerWidth / window.innerHeight, 0.01, 1000
	);

	// Hack until entities are worked out
	engine.player = new Player( camera ); // TODO: Attach separately
	engine.player.getModel().position.set( -8, -8, 1 );

	scene.add( engine.player.getModel() );

	renderer = new WebGLRenderer({
		antialias: false
	});
	// renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setPixelRatio( 1 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0xFFFFFF );
	document.body.appendChild( renderer.domElement );
	window.addEventListener( "resize", onWindowResize, false );

	engine.start();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {

	// Move to player
	if ( engine.player.enabled ) {
		const time = performance.now();
		const delta = ( time - prevTime );
		prevTime = time;
		engine.tick();
	}

	// Render
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

init();
animate();
