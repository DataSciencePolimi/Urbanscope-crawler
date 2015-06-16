'use strict';
// Load system modules

// Load modules
let moment = require( 'moment' );
let bunyan = require( 'bunyan' );
let ig = require( 'instagram-node' );
let Promise = require( 'bluebird' );

// Load my modules
let apiKeys = require( '../../config/instagram-keys.json' );



// Constant declaration
const MAX_RESULTS = 100; // 33 in reality
const MAX_REQUESTS = 5000; // jshint ignore: line
const WINDOW = 1000*60*60; // 1 h;
// const WINDOW = 1000*30; // 30 sec;
// const COLLECTION_NAME = 'tweets';
const SOCIAL = 'instagram';


// Module variables declaration
let log = bunyan.createLogger( {
  name: SOCIAL,
  level: 'trace',
} );
let api = ig.instagram();
log.trace( { apiKeys: apiKeys }, 'Using api keys' );
api.use( apiKeys );



// Module class declaration


// Module functions declaration
function wrap( media ) {
  log.trace( 'Converting media %s', media.id ); // jshint ignore: line
  let date = moment.unix( media.created_time ); // jshint ignore: line

  let location = media.location;

  let post = {
    source: SOCIAL,
    id: media.id,
    text: media.caption? media.caption.text: '',
    date: date.toDate(),
    location: location? {
      type: 'Point',
      coordinates: [ location.longitude, location.latitude ],
    } : null,
    author: media.user.username,
    authorId: media.user.id,
    tags: media.tags,
    raw: media,
  };

  return post;
}



function wrapAll( medias ) {
  log.trace( 'Wrapping %d media to posts', medias.length );
  let wrapped = medias.map( wrap );
  let filtered = wrapped.filter(  function( t ) {
    return t.location;
  } );
  return filtered;
}


function* query( lat, lon, distance ) {
  try {
    let options = {
      distance: distance,
      count: MAX_RESULTS,
    };
    let results = yield api.media_searchAsync( lat, lon, options ); // jshint ignore: line
    let medias = results[ 0 ];

    log.debug( 'Retrieved %d medias', medias.length );
    return yield wrapAll( medias );
  } catch( err ) {
    if( err.code===429 ) { // Rate limit reached
      log.debug( 'Limit reached, waiting' );
      yield Promise.delay( WINDOW );
      return yield query( lat, lon, distance );
    }

    throw err;
  }
}


// Module initialization (at first load)
api = Promise.promisifyAll( api );


// Entry point

// Exports
module.exports.query = query;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78