// Terrarium is distributed under the MIT license.

import { Fog, PerspectiveCamera,
	Float32BufferAttribute, MeshLambertMaterial, Mesh,
	WebGLRenderer, BufferGeometry, Vector3 } from "three";
import PlayerController from "./controls/PlayerController";
import scene from "./scene";
import { ipcRenderer } from "electron";
import DaylightSystem from "./world/DaylightSystem";

let camera;
let renderer;
let player;
let daylightSystem;

function init() {
	camera = new PerspectiveCamera(
		75, window.innerWidth / window.innerHeight, 0.01, 1000
	);

	player = new PlayerController( camera );
	player.spawn();

	scene.fog = new Fog( 0xffffff, 0, 512 );
	daylightSystem = new DaylightSystem();
	scene.add( daylightSystem );

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

function loop() {

	// Drive the engine in main.ts
	ipcRenderer.send( "TICK", player.netInputData );

	// Render
	renderer.render( scene, camera );
	requestAnimationFrame( loop );
}

init();
loop();

ipcRenderer.on( "STATE", ( e, state ) => {
	const material = new MeshLambertMaterial({
		color: 0xAAAAAA
	});
	let positionComponent;
	let position;
	state.entities.forEach( ( entity ) => {
		switch( entity.type ) {
			case "terrain-chunk":
				const geometry = new BufferGeometry();
				const geometryComponent = entity.components.find( ( component ) => {
					return component.type === "buffer-geometry";
				});
				positionComponent = entity.components.find( ( component ) => {
					return component.type === "position";
				});
				position =  new Vector3(
					positionComponent.data.x,
					positionComponent.data.y,
					positionComponent.data.z
				);
				geometry.setIndex( geometryComponent.data.index );
				geometry.addAttribute(
					"position", new Float32BufferAttribute( geometryComponent.data.position, 3 )
				);
				geometry.addAttribute(
					"normal", new Float32BufferAttribute( geometryComponent.data.normal, 3 )
				);
				geometry.addAttribute(
					"uv", new Float32BufferAttribute( geometryComponent.data.uv, 2 )
				);
				const mesh = new Mesh( geometry, material );
				mesh.position.copy( position );
				scene.add( mesh );
				break;
			case "player":
				positionComponent = entity.components.find( ( component ) => {
					return component.type === "position";
				});
				position = positionComponent.data;
				player.model.position.set( position.x, position.y, position.z );
				break;
		}
	});
});
