'use strict';
// Load system modules
var https = require( 'https' );
// var http = require( 'http' );

// Load modules

// Load my modules

// Constant declaration

// Module variables declaration

// Module functions declaration

// Module class declaration

// Module initialization (at first load)

// Entry point
https.globalAgent.options.keepAlive = true;
https.globalAgent.options.maxSockets = 20;

require( './src/index' );

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78