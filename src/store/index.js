// Terrarium is distributed under the MIT license.

import Vue from "vue";
import Vuex from "vuex";

Vue.use( Vuex );

export default new Vuex.Store({
	state: {
		debugMode: true,
		worldSize: 8,
		running: true
	}
});
