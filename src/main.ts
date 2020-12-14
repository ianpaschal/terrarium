// Terrarium is distributed under the MIT license.

import { app, BrowserWindow, ipcMain } from "electron";
import { State } from "aurora";
import * as Path from "path";
import * as URL from "url";

import engine from "./engine";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let window;

const player0 = engine.getAssembly( "player" ).clone();
engine.addEntity( player0 );
engine.start();

function createPlayWindow() {

	// Create the browser window
	window = new BrowserWindow({
		minHeight: 600,
		minWidth: 800,
		width: 800,
		height: 600,
		center: true,
		resizable: true,
		frame: true,
		transparent: false
	});
	window.setMenu( null );

	// and load the index.html of the app
	window.loadURL( URL.format({
		pathname: Path.join( app.getAppPath(), "dist/index.html" ),
		protocol: "file:",
		slashes: true
	}) );

	// Emitted when the window is closed
	window.on( "closed", () => {
		window = undefined;
	});
}

// Create window when app is ready:
app.on( "ready", () => {
	createPlayWindow();
});

// Quit when all windows are closed:
app.on( "window-all-closed", () => {
	app.quit();
});

// Re-create window if somehow it went missing
app.on( "activate", () => {
	if ( window === null ) {
		createPlayWindow();
	}
});

ipcMain.on( "TICK", ( e, data ) => {
	if ( player0 ) {
		player0.setComponentData( "player-input", data );
	}

	// Perform all engine updates
	engine.tick();

	// This state is ONLY entities which were updated
	const state = new State( engine );
	if ( state.entities.length > 0 ) {
		e.sender.send( "STATE", state.flattened );

		// Reset the entities now that the client has received updated information
		engine.cleanEntities();
	}
	// TODO: How to despawn entities (such as terrain tiles)?
});

// data = { position: vec3, value: int }
ipcMain.on( "SET_VOXEL_VALUE", ( e, position, value ) => {
	engine.getSystem( "terrain" ).dispatch( "setVoxel", {
		position: position,
		value: value
	});
	/**
	 * We don't send anything back. Chunks will be updated in the terrain system, and changed ones
	 * will be pushed to the renderer thread when the next state is ready to be sent over.
	 */
});
