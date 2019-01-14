// Terrarium is distributed under the MIT license.

import { Object3D, Raycaster, Vector2, Vector3, PerspectiveCamera } from "three";
import PointerLockControls from "./PointerLockControls";
import KeyboardControls from "./KeyboardControls";
import VoxelCursor from "./VoxelCursor";
import scene from "../scene";
import { ipcRenderer } from "electron";

/**
 * @classdesc The Player Controller class uses a KeyboardInput Controller, a MouseInputController,
 * and a cursor to manipulate scene objects. It is a singleton tied to the renderer process.
 */
export default class PlayerController {

	camera          : PerspectiveCamera;
	cursor          : Object3D;
	enabled         : boolean;
	index           : number;
	input           : any;
	keyboardControls: KeyboardControls;
	model           : Object3D;
	mouse           : Vector2;
	mouseControls   : PointerLockControls;
	pitchObject     : Object3D;
	raycaster       : Raycaster;
	terrain         : Object3D;

	constructor( camera ) {

		this.model = new Object3D();

		this.index = 0;

		this.camera = camera;
		this.camera.up.set( 0, 0, 1 );
		this.camera.rotation.set( Math.PI / 2, 0, 0 );

		this.pitchObject = new Object3D();
		this.pitchObject.add( camera );
		// this.model.position.z = 10;
		this.model.add( this.pitchObject );

		this.raycaster = new Raycaster( new Vector3(), new Vector3(), 0, 8 );
		// this.cursor = new VoxelCursor();
		// scene.add( this.cursor );
		// this.terrain = scene.getObjectByName( "terrain" );

		this.input = {
			forward: false,
			backward: false,
			left: false,
			right: false,
			up: false,
			down: false
		};

		this.addKeyboardHandlers();
		this.addMouseHandlers();
	}

	addKeyboardHandlers() {
		this.keyboardControls = new KeyboardControls();

		// Esc
		this.keyboardControls.addHandler( 27, () => {
			if ( !this.enabled ) {
				this.mouseControls.enabled = true;
				this.enabled = true;
				const blocker = document.getElementById( "blocker" );
				blocker.style.display = "none";
				document.body.requestPointerLock();
			} else {
				this.mouseControls.enabled = false;
				this.enabled = false;
				const blocker = document.getElementById( "blocker" );
				blocker.style.display = "";
				document.exitPointerLock();
			}
		}, ()=>{});

		// Space
		this.keyboardControls.addHandler( 32, () => {
			this.input.up = true;
		}, () => {
			this.input.up = false;
		});

		// Shift
		this.keyboardControls.addHandler( 16, () => {
			this.input.down = true;
		}, () => {
			this.input.down = false;
		});

		// A
		this.keyboardControls.addHandler( 65, () => {
			this.input.left = true;
		}, () => {
			this.input.left = false;
		});

		// D
		this.keyboardControls.addHandler( 68, () => {
			this.input.right = true;
		}, () => {
			this.input.right = false;
		});

		// S
		this.keyboardControls.addHandler( 83, () => {
			this.input.backward = true;
		}, () => {
			this.input.backward = false;
		});

		// W
		this.keyboardControls.addHandler( 87, () => {
			this.input.forward = true;
		}, () => {
			this.input.forward = false;
		});
	}

	addMouseHandlers() {
		this.mouseControls = new PointerLockControls();
		this.mouseControls.addHandler( "move", ( pitch, yaw ) => {
			this.model.rotation.z = yaw;
			this.pitchObject.rotation.x = pitch;
			// this.updateCursor();
		});
		this.mouseControls.addHandler( 0, () => {
			if ( this.cursor.visible ) {
				// engine.getSystem( "terrain-generation" ).dispatch( "setVoxel", {
				// 	position: this.cursor.position.clone(),
				// 	value: 0
				// });
			}
			this.updateCursor();
		});
		this.mouseControls.addHandler( 2, () => {
			if ( this.cursor.visible ) {
				// engine.getSystem( "terrain-generation" ).dispatch( "setVoxel", {
				// 	position: this.cursor.position.clone().add( this.cursor.direction ),
				// 	value: 2
				// });
			}
			this.updateCursor();
		});
	}

	updateCursor() {
		this.mouse = new Vector2( 0, 0 );
		this.raycaster.setFromCamera( this.mouse, this.camera );
		const intersects = this.raycaster.intersectObject( this.terrain, true );

		if ( intersects[ 0 ] ) {
			// if ( !this.cursor.visible ) {
			// 	this.cursor.visible = true;
			// }
			this.cursor.position.copy( intersects[ 0 ].face.voxelPosition );
			this.cursor.direction.copy( intersects[ 0 ].face.normal );
		} else {
			// this.cursor.visible = false;
		}
	}

	get netInputData() {
		let x = 0;
		let y = 0;
		let z = 0;
		if ( this.input.left ) {
			x -= 1;
		}
		if ( this.input.right ) {
			x += 1;
		}
		if ( this.input.forward ) {
			y += 1;
		}
		if ( this.input.backward ) {
			y -= 1;
		}
		if ( this.input.up ) {
			z += 1;
		}
		if ( this.input.down ) {
			z -= 1;
		}
		/**
		 * Normalize the input so that holding forward and left doesn't create a
		 * "faster" or "more powerful" diagonal movement.
		 */
		const horizontal = new Vector2( x, y );
		horizontal.normalize();
		horizontal.rotateAround( new Vector2( 0, 0 ), this.model.rotation.z );

		return {
			x: horizontal.x,
			y: horizontal.y,
			z: z
		};
	}

	spawn() {
		// this.model.position.set( -8, -8, 1 );
		scene.add( this.model );
	}
}
