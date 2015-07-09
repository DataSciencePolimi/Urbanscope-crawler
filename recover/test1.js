'use strict';
// Load system modules
let fs = require( 'fs' );

// Load modules
let _ = require( 'lodash' );
let co = require( 'co' );
let monk = require( 'monk' );
let turf = require( 'turf' );
let Twit = require( 'twit' );
let Promise = require( 'bluebird' );
let wrap = require( '@volox/social-post-wrapper' );
let nils = require( '../config/nils.json' );
let ids = require( './ids.json' );
let keys = require( './keys.json' );

// Load my modules

// Constant declaration
const WINDOW = 1000*60*15; // 15 Minutes
const WRAP_OPTS = {
  field: 'source',
};

// Module variables declaration
let db = monk( 'localhost/UrbanScope' )
let coll = db.get( 'posts' );

// Module functions declaration
function toGeoPoint( coords, index ) {
  return turf.point( coords, {
    index: index
  } );
}
function getNilForPosts( posts ) {
  // Map coordinates to GeoJSON Point
  let mappedPoints = _( posts )
  .filter( 'location.coordinates' )
  .map( function( p, index ) {
    return toGeoPoint( p.location.coordinates, index );
  } )
  .value();


  // Create a feature collection, to be used with TURF
  let fcPoints = turf.featurecollection( mappedPoints );

  // Tag all the points with the corresponding nil
  let taggedPoints = turf.tag( fcPoints, nils, 'ID_NIL', 'nil' );

  return taggedPoints;
}

function* savePosts( posts ) {
  let taggedPoints = getNilForPosts( posts );

  for( let point of taggedPoints.features ) {
    let index = point.properties.index;
    let nil = point.properties.nil;
    let rawPost = posts[ index ];

    try {
      // Set the nil ont the post
      rawPost.nil = nil;

      // Try to create and save the post
      yield coll.insert( rawPost );

    } catch( err ) {
      console.error( 'Save post %s error', rawPost.id, err );
    }
  }
}

function* getTweet( id ) {
  try {
    let result = yield api.getAsync( 'statuses/show/:id', { id } );
    let tweet = result[0];
    // console.log( tweet )

    if( !tweet ) throw new Error( 'No tweet' );

    let post = wrap( tweet, 'twitter', WRAP_OPTS );
    return post;

  } catch( err ) {
    // Rate limited
    if( err.code===88 ) {
      yield Promise.delay( WINDOW );
      return yield getTweet( id );
    }
    console.error( 'Cannot get %s error', id, err );
    return null;
  }
}

// Module class declaration

// Module initialization (at first load)
let apis = new Twit( {
  consumer_key: 'EnyAHmVRKi72S8o2vrkJw',
  consumer_secret: 'EbKKZvBHN0ctByoD95IxdDWjUKvvWshunOBJZGmHuMA',
  app_only_auth: true,
} );
api = Promise.promisifyAll( api );

// Entry point
co( function*() {
  let size = 400;
  for( let i=0; i<ids.length; i+=size ) {
    let bulk = [];
    let start = i;
    let end = i+size;
    let arr = ids.slice( start, end );

    console.log( 'Get from %d to %d = %d elements', start, end, arr.length, arr );

    for( let id of arr ) {
      bulk.push( getTweet( id ) );
    }

    console.log( 'Performing %d bulk operations', bulk.length );
    let posts = yield bulk; // 450 bulk ops
    console.log( 'Done bulk operation, saving' );

    posts = posts.filter( function( p ) { return !!p; } );

    yield savePosts( posts );

    fs.writeFileSync( 'recover_status', start );
    console.log( 'Saved' );
  }
} )
.catch( function( err ) {
  console.error( err.stack );
  db.close();
} )


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78