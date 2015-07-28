'use strict';
// Load system modules
let url = require( 'url' );

// Load modules
let Promise = require( 'bluebird' );
let bunyan = require( 'bunyan' );
let MongoClient = require('mongodb').MongoClient;
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
  return db.collection( name );
}
/*
function getLastID() {
  return getCollection()
  .find()
  .project( { id: 1, _id: 0 } )
  .sort( { date: -1 } )
  .limit( 1 )
  .toArray()
  .then( function( docs ) {
    if( docs ) {
      return ( docs[ 0 ] || {} ).id;
    } else {
      return null;
    }
  } );
}
*/
function* open() {
  let hostname = config.url;
  let dbName = config.database;
  let fullUrl = url.resolve( hostname+'/', dbName );

  log.trace( fullUrl );
  db = yield MongoClient.connect( fullUrl, {
    promiseLibrary: Promise,
  } );
  collection = getCollection();

  // Create the indexes
  yield collection.createIndexes( [
    {
      name: 'ID',
      key: { id: 1 },
      background: true,
      unique: true,
    },
    {
      name: 'Date',
      key: { date: 1 },
      background: true,
    },
    {
      name: 'Author',
      key: { author: 1 },
      background: true,
    },
    {
      name: 'Author ID',
      key: { authorId: 1 },
      background: true,
    },
    {
      name: 'Source',
      key: { source: 1 },
      background: true,
    },
    {
      name: 'NIL',
      key: { nil: 1 },
      background: true,
    },
    {
      name: 'Language',
      key: { lang: 1 },
      background: true,
    },
    {
      name: 'Location',
      key: { location: '2dsphere' },
      background: true,
    },
  ] );

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
// module.exports.getLastID = getLastID;


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78