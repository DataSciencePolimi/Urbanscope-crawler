'use strict';
// Load system modules
let url = require( 'url' );

// Load modules
let bunyan = require( 'bunyan' );
let monk = require( 'monk' );
// let wrap = require( 'co-monk' );

// Load my modules
let config = require( '../../config/mongo.json' );

// Constant declaration
const COLLECTION_NAME = 'posts';

// Module variables declaration
let db, collection;
let log = bunyan.createLogger( {
  name: 'model',
  level: 'trace',
} );


// Module functions declaration
function getDB() {
  return db;
}
function getCollection( name ) {
  name = name || COLLECTION_NAME;
  // return wrap( db.get( name ) );
  return db.get( name );
}
function* open() {
  let hostname = config.url;
  let dbName = config.database;
  let fullUrl = url.resolve( hostname+'/', dbName );

  log.trace( fullUrl );
  db = monk( fullUrl );
  collection = getCollection();

  // Create the indexes
  collection.index( 'id', { index: true, unique: true, background: true } );
  collection.index( 'date', { index: true, background: true } );
  collection.index( 'author', { index: true, background: true } );
  collection.index( 'authorId', { index: true, background: true } );
  collection.index( 'source', { index: true, background: true } );
  collection.index( 'nil', { index: true, background: true } );
  collection.index( 'lang', { index: true, background: true } );
  collection.index( { location: '2dsphere' } );

  return db;
}
function close() {
  db.close();
}
// Module class declaration


// Module initialization (at first load)

// Entry point

// Exports
module.exports.open = open;
module.exports.close = close;
module.exports.getDB = getDB;
module.exports.getCollection = getCollection;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78