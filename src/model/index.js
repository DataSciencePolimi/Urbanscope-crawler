'use strict';
// Load system modules
import url from 'url';

// Load modules
import bunyan from 'bunyan';
import Mongorito from 'mongorito';

// Load my modules
import Post from './post';
import config from '../../config/mongo.json';

// Constant declaration


// Module variables declaration
let log = bunyan.createLogger( {
  name: 'model',
  level: 'trace',
} );


// Module functions declaration
function* init() {

  yield Post.index( 'id', { unique: true } );
}

// Module class declaration


// Module initialization (at first load)
let hostname = config.url;
let dbName = config.database;
let fullUrl = url.resolve( hostname+'/', dbName );

// Entry point
log.trace( fullUrl );
Mongorito.connect( fullUrl );

// Exports
export default init;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78