// Voxeland is distributed under the MIT license.

import { Scene } from "three";
import Vue from "vue";
import Vuex from "vuex";
import SimplexNoise from "simplex-noise";
import Player from "../Player";

Vue.use( Vuex );

export default new Vuex.Store({
	state: {
		scene: new Scene(),
		debugMode: true,
		simplex: new SimplexNoise(),
		worldSize: 8,
		running: true,
		player: new Player()
	}
});
