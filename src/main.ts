// Terrarium is distributed under the MIT license.

import { app, BrowserWindow } from "electron";
import * as Path from "path";
import * as URL from "url";

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
	// window.on( "closed", () => {
	// 	delete window;
	// });
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
