import {
	AmbientLight, HemisphereLight, DirectionalLight, Object3D
} from "three";
class DaylightSystem {
	constructor() {
		const root = new Object3D();

		// LIGHTS
		const ambientLight = new AmbientLight( 0xffffff, 0.25 );
		const hemiLight = new HemisphereLight( 0xffffff, 0xffffff, 0.25 );
		hemiLight.color.setHSL( 0.6, 1, 0.6 );
		hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
		hemiLight.position.set( 0, 0, 1 );
		// let hemiLightHelper = new Three.HemisphereLightHelper( hemiLight, 10 );
		// STORE.state.scene.add( hemiLightHelper );
		const dirLight = new DirectionalLight( 0xffffff, 0.5 );
		dirLight.color.setHSL( 0.1, 1, 0.95 );
		dirLight.position.set( 50, -50, 50 );
		dirLight.position.multiplyScalar( 30 );
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;
		const d = 50;
		dirLight.shadow.camera.left = -d;
		dirLight.shadow.camera.right = d;
		dirLight.shadow.camera.top = d;
		dirLight.shadow.camera.bottom = -d;
		dirLight.shadow.camera.far = 3500;
		dirLight.shadow.bias = -0.0001;
		// let dirLightHeper = new Three.DirectionalLightHelper( dirLight, 10 );
		// STORE.state.scene.add( dirLightHeper );
		root.add( ambientLight );
		root.add( hemiLight );
		root.add( dirLight );
		return root;
	}
}

export default DaylightSystem;
