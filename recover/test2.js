'use strict';
// Load system modules
let fs = require( 'fs' );

// Load modules
let _ = require( 'lodash' );
let co = require( 'co' );
let monk = require( 'monk' );
let turf = require( 'turf' );
let Promise = require( 'bluebird' );
let wrap = require( '@volox/social-post-wrapper' );
let nils = require( '../config/nils.json' );

// Load my modules

// Constant declaration
const WINDOW = 1000*60*15; // 15 Minutes
const WRAP_OPTS = {
  field: 'source',
};

// Module variables declaration
let db1 = monk( 'localhost/UrbanScope' );
let postCollection = db1.get( 'posts' );
let db2 = monk( 'localhost/TweetsMilanoHub' );
let tweetCollection = db2.get( 'tweets' );

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

function* savePosts( postList ) {
  let taggedPoints = getNilForPosts( postList );

  for( let point of taggedPoints.features ) {
    let index = point.properties.index;
    let nil = point.properties.nil;
    let rawPost = postList[ index ];

    try {
      // Set the nil ont the post
      rawPost.nil = nil;

      // Try to create and save the post
      yield postCollection.insert( rawPost );

    } catch( err ) {
      console.error( 'Save post %s error', rawPost.id, err );
    }
  }
}

// Module class declaration

// Module initialization (at first load)

// Entry point
let postList = [];
tweetCollection.find( {}, {
  // limit: 500,
  stream: true,
} )
.each( function( d ) {
  let tweet = d.raw;
  if( tweet ) {
    let post = wrap( tweet, 'twitter', WRAP_OPTS );
    postList.push( post );
  } else {
    postList.push( {
      id: d.idsource_str,
      text: d.text,
      date: d.createdDate,
      location: d.location,
      author: d.author,
      authorId: d.idauthor,
      lang: d.language,
      source: 'twitter',
      tags: [], // Missing
      raw: {}, // Missing
    } );
  }
} )
.success( function() {
  console.log( 'List = %d', postList.length );

  co( function*() {
    yield savePosts( postList );

    db1.close();
    db2.close();
  } )
  .catch( function( err ) {
    console.error( 'NUIUUUU', err );
    db1.close();
    db2.close();
  } )
} );


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78