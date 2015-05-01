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
function* open() {
  let hostname = config.url;
  let dbName = config.database;
  let fullUrl = url.resolve( hostname+'/', dbName );

  log.trace( fullUrl );
  Mongorito.connect( fullUrl );

  yield Post.index( 'id', { index: true, unique: true } );
  yield Post.index( 'date', { index: true } );
  yield Post.index( 'author', { index: true } );
  yield Post.index( 'authorId', { index: true } );
  yield Post.index( 'source', { index: true } );
  yield Post.index( { location: '2dsphere' } );
}
function close() {
  Mongorito.disconnect();
}

// Module class declaration


// Module initialization (at first load)

// Entry point

// Exports
export { open, close };


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78