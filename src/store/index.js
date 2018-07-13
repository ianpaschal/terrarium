import { Scene } from "three";
import Vue from "vue";
import Vuex from "vuex";
import SimplexNoise from "simplex-noise";

Vue.use( Vuex );

export default new Vuex.Store({
	state: {
		scene: new Scene(),
		debugMode: true,
		simplex: new SimplexNoise(),
		worldSize: 8
	}
});
