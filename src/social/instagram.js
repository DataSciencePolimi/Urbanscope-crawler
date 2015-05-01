'use strict';
// Load system modules

// Load modules
import bunyan from 'bunyan';
import Twitter from 'twit';
import Promise from 'bluebird';

// Load my modules
import apiKeys from '../../config/instagram-keys.json';

// Constant declaration
const MAX_RESULTS = 100;
const MAX_REQUESTS = 5000; // 450;
const WINDOW = 1000*60*60; // 1h;
// const WINDOW = 1000*30; // 30 sec;


// Module variables declaration
let log = bunyan.createLogger( {
  name: 'instagram',
  level: 'trace',
} );
let api = new Twitter( apiKeys );
log.trace( { apiKeys }, 'Using api keys' );

// Module functions declaration

// Module class declaration

// Module initialization (at first load)
api = Promise.promisifyAll( api );


// Entry point

// Exports
export default function* query( lat, lon, radius ) {
  let geocode = `${lat},${lon},${radius}km`;
  log.trace( 'Geocode: %s', geocode );

  try {
    let tweets = yield api.getAsync( 'search/tweets', { geocode, count: MAX_RESULTS } );
    log.debug( 'Retrieved %d tweets', tweets.length );

  } catch( err ) {
    log.error( err, 'Twitter query failed: %s', err.message );

    if( err.code && err.code===88 ) { // Rate limit reached
      log.debug( 'Limit reached, waiting' );
      yield Promise.delay( WINDOW );
    }
  }
}

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78