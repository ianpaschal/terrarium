// Terrarium is distributed under the MIT license.

import { app, BrowserWindow, ipcMain } from "electron";
import * as Path from "path";
import * as URL from "url";

import engine from "./engine";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let window;

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
	// console.log( data );
	// engine.tick();
	e.sender.send( "STATE", {
		entities: [ "poop" ]
	});
});

// When the keyboard controller changes the player input, it arrives here and is used by the
// movement system
// data = { front, back, left, right, up, down bools }
ipcMain.on( "PLAYER_INPUT", ( e, index, data ) => {
	console.log( index, data );
});

// When the scene and mouse controller change the cursor location, it arrives here
// data = { vec3, value }
ipcMain.on( "set-voxel-value", ( e, data ) => {

});

engine.start();

// TODO: Add listener after each tick which sends over any currently built chunk's buffer data
// get system terrain
// get all chunk mesh datas
// storeWindow.webContents.send('TERRAIN_MESH_DATA', data);
