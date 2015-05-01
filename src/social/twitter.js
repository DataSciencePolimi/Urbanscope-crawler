'use strict';
// Load system modules

// Load modules
import moment from 'moment';
import bunyan from 'bunyan';
import Twitter from 'twit';
import Promise from 'bluebird';

// Load my modules
import apiKeys from '../../config/twitter-keys.json';
import Post from '../model/post';


// Constant declaration
const MAX_RESULTS = 100;
const MAX_REQUESTS = 180; // jshint ignore: line
const WINDOW = 1000*60*15; // 15 min;
// const WINDOW = 1000*30; // 30 sec;
// const COLLECTION_NAME = 'tweets';
const SOCIAL = 'twitter';
const DATE_FORMAT = 'dd MMM DD HH:mm:ss ZZ YYYY';


// Module variables declaration
let log = bunyan.createLogger( {
  name: SOCIAL,
  level: 'trace',
} );
let api = new Twitter( apiKeys );
log.trace( { apiKeys }, 'Using api keys' );



// Module class declaration


// Module functions declaration
function wrap( tweet ) {
  log.trace( 'Converting tweet %s', tweet.id_str ); // jshint ignore: line
  let tags = [];
  if( tweet.entities ) {
    tags = tweet.entities.hashtags.map( h => h.text );
  }
  let date = moment( tweet.created_at, DATE_FORMAT, 'en' ); // jshint ignore: line

  let post = new Post( {
    source: SOCIAL,
    id: tweet.id_str, // jshint ignore: line
    text: tweet.text,
    date: date.toDate(),
    location: tweet.coordinates,
    author: tweet.user.screen_name, // jshint ignore: line
    authorId: tweet.user.id_str, // jshint ignore: line
    tags: tags,
    raw: tweet,
  } );

  return post;
}



function wrapAll( tweets ) {
  log.trace( 'Wrapping %d tweets to posts', tweets.length );
  return tweets.map( wrap );
}


function* query( lat, lon, radius ) {
  let geocode = `${lat},${lon},${radius}km`;
  log.trace( 'Geocode: %s', geocode );

  try {
    let [ data ] = yield api.getAsync( 'search/tweets', { geocode, count: MAX_RESULTS } );
    let tweets = data.statuses;
    log.debug( 'Retrieved %d tweets', tweets.length );
    return yield wrapAll( tweets );
  } catch( err ) {
    if( err.code===88 ) { // Rate limit reached
      log.debug( 'Limit reached, waiting' );
      yield Promise.delay( WINDOW );
      return yield query( lat, lon, radius );
    }

    throw err;
  }
}


// Module initialization (at first load)
api = Promise.promisifyAll( api );


// Entry point

// Exports
export { query };

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78