// Terrarium is distributed under the MIT license.

import {
	PerspectiveCamera,
	Raycaster,
	Vector2,
	Vector3,
	WebGLRenderer
} from "three";
import Player from "./core/Player";
import engine from "./engine";

// Hack until we have entities:
engine.player = new Player();

// TODO: Move to mouse controls or player...
const mouse = new Vector2( 0, 0 );
const raycaster = new Raycaster( new Vector3(), new Vector3(), 0, 8 );

let camera;
let renderer;

let prevTime = performance.now();

// ==================================================================

// MOVE TO VIEWPORT

// ==================================================================

function init() {
	camera = new PerspectiveCamera(
		75, window.innerWidth / window.innerHeight, 0.01, 1000
	);
	engine.player.attachCamera( camera );
	engine.player.getModel().position.set( -8, -8, 1 );

	engine.scene.add( engine.player.getModel() );

	const pointerlockchange = function() {
		if ( document.pointerLockElement === document.body ) {
			engine.player.enabled = true;
			const blocker = document.getElementById( "blocker" );
			blocker.style.display = "none";
		} else {
			engine.player.enabled = false;
			const blocker = document.getElementById( "blocker" );
			blocker.style.display = "block";
		}
	};
	document.addEventListener( "pointerlockchange", pointerlockchange, false );

	renderer = new WebGLRenderer({
		antialias: false
	});
	renderer.setPixelRatio( window.devicePixelRatio );
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
	if ( engine.player.enabled ) {
		const time = performance.now();
		const delta = ( time - prevTime );
		prevTime = time;

		// Update all systems
		engine.update( delta );
	}

	// Mouse picking
	raycaster.setFromCamera( mouse, camera );
	const intersects = raycaster.intersectObjects( engine.scene.children, true );
	// const hoverMat = new MeshLambertMaterial({ color: 0xFF00FF });
	if ( intersects[ 0 ] ) {
		// intersects[ 0 ].object.material = hoverMat;
	}

	// Render
	renderer.render( engine.scene, camera );
	requestAnimationFrame( animate );
}

init();
animate();
