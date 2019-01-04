// Forge source code is distributed under the MIT license.

const Webpack = require( "webpack" );
const path = require( "path" );

module.exports = {
	target: "electron",
	node: {
		__dirname: true,
		__filename: true,
	},
	entry: {
		main: "./src/main.js",
		play: "./src/play.js"
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					"vue-style-loader",
					"css-loader"
				],
			},
			{
				test: /\.vue$/,
				loader: "vue-loader",
				options: {
					loaders: {
					}
					// other vue-loader options go here
				}
			},
			{
				test: /\.js$/,
				loader: "babel-loader",
				exclude: /node_modules/
			},
			{
				test: /\.(png|jpg|gif|svg)$/,
				loader: "file-loader",
				options: {
					name: "[name].[ext]?[hash]"
				}
			}
		]
	},
	resolve: {
		alias: {
			"vue$": "vue/dist/vue.esm.js",
			"@": path.join( __dirname, "src" )
		},
		extensions: [ "*", ".js", ".vue", ".json" ]
	},
	plugins: [
		new Webpack.EnvironmentPlugin( [
			"NODE_ENV",
		] ),
		new Webpack.IgnorePlugin( /uws/ )
	],

	/* Webpack tries to resolve electron module with the installed node_modules.
		But the electron module is resolved in Electron itself at runtime. So, you
		have to exclude particular module from webpack bundling like this: */
	/*
	externals: [
		( function () {
			const IGNORES = [
				"electron"
			];
			return function ( context, request, callback ) {
				if ( IGNORES.indexOf( request ) >= 0 ) {
					return callback( null, "require('" + request + "')" );
				}
				return callback();
			};
		})()
	]
	*/
};
