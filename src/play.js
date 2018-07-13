// // Forge source code is distributed under the MIT license.

import Vue from "vue";
import store from "./store";
import App from "./components/App.vue";
import DaylightSystem from "./world/DaylightSystem";
import Terrain from "./world/Terrain";
import { Box3 } from "three";

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
			this.$nextTick( function() {
				const keyboardEvents = [ "keydown", "keyup" ];
				for ( const event of keyboardEvents ) {
					window.addEventListener( event, this.handleKeyboard, false );
				}
				store.state.scene.add( new DaylightSystem() );
				// const size = store.state.worldSize;
				// for ( let x = size / -2; x < size / 2; x++ ) {
				// 	for ( let y = size / -2; y < size / 2; y++ ) {
				// 		store.state.scene.add( new Terrain( x, y ) );
				// 	}
				// }
				store.state.scene.add( new Terrain( -1, -1 ) );
				store.state.scene.add( new Terrain( -1, 0 ) );
				store.state.scene.add( new Terrain( 0, -1 ) );
				store.state.scene.add( new Terrain( 0, 0 ) );
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
			handleKeyboard( e ) {
				console.log( e.which );
				return;
			}
		}
	});
};
