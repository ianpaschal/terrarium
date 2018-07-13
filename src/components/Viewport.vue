<template>
	<div id="viewport"></div>
</template>

<script>
import OrbitControlModule from "three-orbit-controls";
import * as Three from "three";
const OrbitControls = OrbitControlModule( Three );
export default {
	name: "Viewport",
	props: [ "options" ],
	data() {
		return {
			raycaster: new Three.Raycaster(),
			mouse: new Three.Vector2(),
			width: 0,
			height: 0
		};
	},
	mounted() {
		this.width = this.$el.offsetWidth;
		this.height = this.$el.offsetHeight;
		this.aspect = this.width / this.height;

		this.camera = new Three.PerspectiveCamera( 30, this.aspect, 1, 10000 );
		this.camera.position.set( -10, -10, 10 );
		this.camera.up.set( 0, 0, 1 );

		// Action!
		this.renderer = new Three.WebGLRenderer({
			// alpha: true,
			antialias: false
		});
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( this.$el.offsetWidth, this.$el.offsetHeight );
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.renderReverseSided = false;

		this.$el.appendChild( this.renderer.domElement );

		this.controls = new OrbitControls( this.camera, this.$el );
		this.controls.target = new Three.Vector3( 0, 0, 0 );
		this.controls.enabled = true;

		window.addEventListener( "resize", this.onResize, false );
		this.loop();
	},
	methods: {
		loop() {
			this.renderer.render( this.$store.state.scene, this.camera );
			requestAnimationFrame( this.loop );
		},
		onResize( e ) {
			this.width = this.$el.offsetWidth;
			this.height = this.$el.offsetHeight;
			this.camera.aspect = this.width / this.height;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize( this.width, this.height );
		}
	}
};
</script>

<style lang="less" scoped>
	@viewport-bg: #FF0000;
	#viewport {
		background-color: @viewport-bg;
		width: 100%;
		height: 100%;
		position: absolute;
	}
</style>
