// Terrarium is distributed under the MIT license.

import Vue from "vue";
import store from "../store";
import App from "./components/App.vue";
// import DaylightSystem from "./world/DaylightSystem";
// import Terrain from "./world/Terrain";
// import { Raycaster, Vector3 } from "three";
// import { inherits } from "util";

// const raycaster = new Raycaster();
// const loopTime = 10;
// function physicsLoop() {
// 	const player = store.state.player;

// 	// update the picking ray with the camera and mouse position
// 	raycaster.set( player.model.position.clone(), new Vector3( 0, 0, -1 ) );

// 	// calculate objects intersecting the picking ray
// 	const inter = raycaster.intersectObjects(
// 		store.state.scene.children, true );

// 	if ( inter[ 0 ] ) {
// 		player.offset = inter[ 0 ].distance;
// 	} else {
// 		player.offset = 0;
// 	}
// 	const gravity = player.model.position.z > 2 ? -9.8 : 0;

// 	// If in the air, do not accelerate upwards.

// 	player.velocity.z += ( player.acceleration.z + gravity ) * loopTime / 100;
// 	console.log( player.velocity.z );
// 	player.model.position.z += player.velocity.z * loopTime / 100;

// 	player.model.position.z = Math.max( player.model.position.z, 2 );

// 	if ( player.model.position.z <= 2 ) {
// 		player.velocity.z = 0;
// 	}

// 	// reset acceleration
// 	player.acceleration.z = 0;

// 	// if ( player.offset > 0 ) {

// 	// } else {
// 	// 	player.velocity.z = 0;
// 	// 	player.model.position.z = 0.5;
// 	// }

// 	player.model.position.x += player.velocity.x * loopTime / 100;
// 	player.model.position.y += player.velocity.y * loopTime / 100;
// }

window.onload = () => {
	new Vue({
		el: "#vue-wrapper",
		store: store,
		data: {
			windowWidth: 0,
			windowHeight: 0
		},
		render: ( h ) => h( App ),
		beforeMount() {
			window.addEventListener( "resize", this.getWindowWidth );
			window.addEventListener( "resize", this.getWindowHeight );
		},
		mounted: function() {
			this.$nextTick( () => {
				// const keyboardEvents = [ "keydown", "keyup" ];
				// for ( const event of keyboardEvents ) {
				// 	window.addEventListener( event, this.handleKeyboard, false );
				// }
				init();
				// store.state.scene.add( new DaylightSystem() );
				// const size = store.state.worldSize;
				// for ( let x = size / -2; x < size / 2; x++ ) {
				// 	for ( let y = size / -2; y < size / 2; y++ ) {
				// 		store.state.scene.add( new Terrain( x, y ) );
				// 	}
				// }
				// store.state.scene.add( new Terrain( -1, -1 ) );
				// store.state.scene.add( new Terrain( -1, 0 ) );
				// store.state.scene.add( new Terrain( 0, -1 ) );
				// store.state.scene.add( new Terrain( 0, 0 ) );
				// store.state.scene.add( store.state.player.model );
				// store.state.player.model.position.x += 0.5;
				// store.state.player.model.position.y += 0.5;
				// store.state.player.model.position.z += 5;
				// setInterval( physicsLoop, loopTime );
			});
		},
		beforeDestroy() {
			window.removeEventListener( "resize", this.getWindowWidth );
			window.removeEventListener( "resize", this.getWindowHeight );
		},
		methods: {
			getWindowWidth() {
				this.windowWidth = document.documentElement.clientWidth;
			},
			getWindowHeight() {
				this.windowHeight = document.documentElement.clientHeight;
			},
			// handleKeyboard( e ) {
			// 	console.log( e.which );
			// 	if ( e.type == "keydown" && store.state.player.model.position.z == 2 ) {
			// 		if ( e.which == 32 ) {
			// 			store.state.player.acceleration.z += 50;
			// 		}
			// 		if ( e.which == 87 ) {
			// 			store.state.player.velocity.y = 5;
			// 		}
			// 		if ( e.which == 83 ) {
			// 			store.state.player.velocity.y = -5;
			// 		}
			// 		if ( e.which == 68 ) {
			// 			store.state.player.velocity.x = 5;
			// 		}
			// 		if ( e.which == 65 ) {
			// 			store.state.player.velocity.x = -5;
			// 		}
			// 	}
			// 	if ( e.type == "keyup" ) {
			// 		if ( e.which == 87 || e.which == 83 ) {
			// 			store.state.player.velocity.y = 0;
			// 		}
			// 		if ( e.which == 65 || e.which == 68 ) {
			// 			store.state.player.velocity.x = 0;
			// 		}
			// 	}
			// 	return;
			// }
		}
	});
};

function init() {
	console.log( "hello world" );
	camera = new PerspectiveCamera(
		75, window.innerWidth / window.innerHeight, 0.01, 1000
	);
	player = new Player( camera );
	player.getModel().position.set( -8, -8, 1 );

	world.scene.add( player.getModel() );

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
