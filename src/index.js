'use strict';
// Load system modules
let fs = require( 'fs' );
let path = require( 'path' );

// Load modules
let co = require( 'co' );
let bunyan = require( 'bunyan' );
let _ = require( 'lodash' );
let turf = require( 'turf' );
let grid = require( 'node-geojson-grid' );
let wrap = require( '@volox/social-post-wrapper' );
let Cralwer = require( '@volox/social-crawler' );

// Load my modules
let gridConfig = require( '../config/grid-config.json' );
let socials = require( '../config/socials.json' );
let nils = require( '../config/nils.json' );
let openMongo = require( './model/' ).open;
let closeMongo = require( './model/' ).close;
let getCollection = require( './model/' ).getCollection;


// Constant declaration
const CONFIG_FOLDER = path.join( __dirname, '..', 'config' );
const GRID_FILE = path.join( CONFIG_FOLDER, 'generated-grids.json' );
const STATUS_FILE = path.join( CONFIG_FOLDER, 'status.json' );
const QUEUE_CAPACITY = 30;
const WRAP_OPTS = {
  field: 'source',
};

// Module variables declaration
let collection;
let queue = [];
let status = {};
let log = bunyan.createLogger( {
  name: 'cralwer',
  level: 'debug',
} );


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

  log.trace( 'Mapped points %d', mappedPoints.length );

  // Create a feature collection, to be used with TURF
  let fcPoints = turf.featurecollection( mappedPoints );

  // Tag all the points with the corresponding nil
  let taggedPoints = turf.tag( fcPoints, nils, 'ID_NIL', 'nil' );

  return taggedPoints;
}

function* savePosts( posts ) {
  log.trace( 'Saving posts to the DB' );

  let taggedPoints = getNilForPosts( posts );

  for( let point of taggedPoints.features ) {
    let index = point.properties.index;
    let nil = point.properties.nil;
    let rawPost = posts[ index ];

    try {
      // Set the nil ont the post
      rawPost.nil = nil;

      // Try to create and save the post
      yield collection.insert( rawPost );

    } catch( err ) {
      if( err.code===11000 ) {
        log.trace( 'Post [%s] already present', rawPost.source );
      } else {
        log.error( err, 'Cannot insert post' );
      }
    }
  }
}
function queuePost( post ) {
  queue.push( post );

  if( queue.length>=QUEUE_CAPACITY ) {
    co( function* () {
      yield savePosts( queue );
    } )
    .catch( function( err ) {
      log.error( err, 'Unable to save the queued posts');
    } )
    .then( function() {
      // Empty the queue
      queue = [];
    } )
    ;
  }
}
function saveState( socialId, index ) {
  status[ socialId ] = index;

  // TODO fix status file
  fs.writeFileSync( STATUS_FILE, JSON.stringify( status ), 'utf8' );
}
function handleData( socialId, data ) {
  let social = socialId.split( '_' )[ 0 ];
  let post = wrap( data, social, WRAP_OPTS );
  // TODO handle incoming data
  log.trace( 'Data recieved {%s}[%s]', socialId, post.id );

  queuePost( post );
}
function handleStatusUpdate( socialId, message, info ) {
  // TODO handle status updates
  let data = _.toArray( arguments ).slice( 3 );
  log.trace( 'Status update for {%s} [%s]', socialId, message, info, data );

  if( message==='done' && info==='grid' ) {
    let lastPoint = data[ 1 ];
    // Save the last DONE coordinate index
    saveState( socialId, lastPoint );
  }
}

// Module class declaration


// Module initialization (at first load)


// Entry point
co( function*() {

  // Setup mongo
  yield openMongo();
  collection = getCollection();

  // Create/load the grid points
  let grids;
  try {
    log.trace( 'Loading from file "%s"', GRID_FILE );
    grids = require( GRID_FILE );
    log.debug( '%d grids loaded', grids.length );
  } catch( err ) {
    log.info( 'Generating grids' );
    let fc = grid.json( gridConfig );
    grids = _.map( fc.features, 'geometry.coordinates' );
    log.trace( 'Generated %d grids', grids.length );

    let json = JSON.stringify( grids, null, 2 );
    fs.writeFileSync( GRID_FILE, json, 'utf8' );
  }

  status = {};
  try {
    status = require( STATUS_FILE );
  } catch( err ) {
    // log.error( err );
  }

  /*
  // Map the social configuration to Crawler specific properties
  socials.forEach( function( social ) {
    // Get grid config
    let gridCfg = social.grid;

    // Map from "gridIndex" property to corresponding generated grid
    let currentGrid = grids[ gridCfg.index ];
    social.geojson = currentGrid.slice( gridCfg.from, gridCfg.to );
    log.trace( 'Social %s for %s have a %d points grid', social.provider, social.id, social.geojson.length );

  } );
  */

  let opts = {
    radius: gridConfig[ 2 ].mpp,
  };
  let cralwer = new Cralwer( socials, opts );
  function runLoop() {
    cralwer.run( 'geo', grids[ 2 ], null, status );
  }

  // Log related events
  cralwer.on( 'log.trace', log.trace.bind( log ) );
  cralwer.on( 'log.debug', log.debug.bind( log ) );
  cralwer.on( 'log.info', log.info.bind( log ) );
  cralwer.on( 'log.warn', log.warn.bind( log ) );
  cralwer.on( 'log.error', log.error.bind( log ) );
  cralwer.on( 'log.fatal', log.fatal.bind( log ) );

  // Data related events
  cralwer.on( 'status', handleStatusUpdate );
  cralwer.on( 'completed', runLoop );
  cralwer.on( 'data', handleData );
  cralwer.once( 'ready', runLoop );

  /*
  cralwer.once( 'ready', function() {
    log.debug( 'Crawler ready' );

    // First run
    cralwer.run( 'geo', grids[ 2 ], {} );

    cralwer.on( 'completed', function() {
      log.debug( 'Crawler cycle completed' );
      // Restart once completed
      cralwer.start();
    } );
  } );
  */
} )
.catch( function( err ) {
  log.fatal( err, 'NUOOOOOOOOO' );
  closeMongo();
} )
;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78