// Terrarium is distributed under the MIT license.

import { PerspectiveCamera,
	Float32BufferAttribute, MeshNormalMaterial, Mesh,
	WebGLRenderer, BufferGeometry, Vector3 } from "three";
import PlayerController from "./controls/PlayerController";
import scene from "./scene";
import { ipcRenderer } from "electron";
import terrain from "./scene/terrain";

let camera;
let renderer;
let player;

function init() {
	camera = new PerspectiveCamera(
		75, window.innerWidth / window.innerHeight, 0.01, 1000
	);

	player = new PlayerController( camera );
	player.spawn();

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
	const material = new MeshNormalMaterial();
	let positionComponent;
	let position;
	state.entities.forEach( ( entity ) => {
		
		switch( entity.type ) {
			case "terrain-chunk":
				console.log( "terrain", entity );
				if ( entity.destroy ) {
					const meshy = terrain.getObjectByName( entity.uuid );
					console.log( meshy );
					// terrain.remove( );
					break;
				}
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
				mesh.name = entity.uuid;
				terrain.add( mesh );
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
