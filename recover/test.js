'use strict';
// Load system modules
let fs = require( 'fs' );

// Load modules
// let Promise = require( 'bluebird' );
let monk = require( 'monk' );
let co = require( 'co' );

// Load my modules

// Constant declaration

// Module variables declaration

// Module functions declaration

// Module class declaration

// Module initialization (at first load)

// Entry point
let db = monk( 'localhost/TweetsMilanoHub' )
co( function*() {
  let coll = db.get( 'tweets' );

  let ids = new Set();
  let i = 0;
  coll.find( {}, {
    // limit: 5000,
    stream: true,
  } )
  .each( function( d ) {
    i++;
    let id = d.idsource_str;
    ids.add( id );
    console.log( 'Pushed data', i, id, ids.size );
  } )
  .success( function() {
    console.log( 'Log has %d elements', ids.size );
    let data = [];
    for( let id of ids ) {
      data.push( id );
    }
    fs.writeFileSync( 'ids.json', JSON.stringify( data, null, 2 ) );
    db.close();
  } );
} )
.catch( function( err ) {
  console.error( err );
  db.close();
} )


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78