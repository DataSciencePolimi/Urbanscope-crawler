'use strict';
// Load system modules
let fs = require( 'fs' );
let path = require( 'path' );

// Load modules
let co = require( 'co' );
let bunyan = require( 'bunyan' );
let turf = require( 'turf' );
let grid = require( 'node-geojson-grid' );

// Load my modules
let gridConfig = require( '../config/grid-config.json' );
let nils = require( '../config/nils.json' );
let openMongo = require( './model/' ).open;
let closeMongo = require( './model/' ).close;
let getCollection = require( './model/' ).getCollection;


// Constant declaration
const CONFIG_FOLDER = path.join( __dirname, '..', 'config' );
const GRID_FILE = path.join( CONFIG_FOLDER, 'generated-grids.json' );

// Module variables declaration
let db, collection;
let STATUS_FILE;
let log = bunyan.createLogger( {
  name: 'cralwer',
  level: 'trace',
} );


// Module functions declaration
function toGeoPoint( coords, index ) {
  return turf.point( coords, {
    index: index
  } );
}
function* savePosts( posts ) {
  // Map coordinates to GeoJSON Point
  let mappedPoints = posts.map( function( p, index ) {
    return toGeoPoint( p.location.coordinates, index );
  } );
  // Create a feature collection, to be used with TURF
  let fcPoints = turf.featurecollection( mappedPoints );

  // Tag all the points with the corresponding nil
  let taggedPoints = turf.tag( fcPoints, nils, 'ID_NIL', 'nil' );

  for( let point of taggedPoints.features ) {
    try {
      let index= point.properties.index;
      let nil = point.properties.nil;
      let rawPost = posts[ index ];

      // Set the nil
      rawPost.nil = nil;

      // Create and save the post
      yield collection.insert( rawPost );

    } catch( err ) {
      if( err.code===11000 ) {
        log.error( 'Post already present' );
      } else {
        log.error( err, 'Cannot insert post' );
      }
    }
  }
}
function saveState( grid, coord ) {
  let status = {
    grid: grid,
    coord: coord,
  };

  let json = JSON.stringify( status, null, 2 );
  fs.writeFileSync( STATUS_FILE, json, 'utf8' );

  return status;
}

// Module class declaration


// Module initialization (at first load)


// Entry point
co( function*() {

  // Setup mongo
  db = yield openMongo();
  collection = getCollection();

  // Load social
  let social = process.argv[ 2 ];
  log.trace( 'Loading module "%s"', social );
  let query = require( './social/'+social ).query;
  STATUS_FILE = path.join( CONFIG_FOLDER, social+'-status.json' );

  // Load status file
  let status;
  try {
    status = require( STATUS_FILE );
    log.info( 'Status loaded %d - %d', status.grid, status.coord );
  } catch( err ) {
    log.info( 'Status not present, creating one' );
    status = saveState( 0, 0 );
  }

  // Create/load the grid points
  let grids;
  try {
    log.trace( 'Loading from file "%s"', GRID_FILE );
    grids = require( GRID_FILE );
    log.debug( 'Grid loaded' );
  } catch( err ) {
    log.info( 'Generating grids' );
    let fc = grid.json( gridConfig );
    grids = fc.features.map( function( f ) {
      return f.geometry.coordinates;
    } );
    log.trace( 'Generated %d grids', grids.length );

    let json = JSON.stringify( grids, null, 2 );

    fs.writeFileSync( GRID_FILE, json, 'utf8' );
  }




  // Cycle over the grids
  for( let gridIndex=status.grid; gridIndex<gridConfig.length; gridIndex++ ) {
    let currentMpp = gridConfig[ gridIndex ].mpp;
    let points = grids[ gridIndex ];
    log.debug( 'Current grid %d with %d points', gridIndex, points.length );

    for( let coordIndex=status.coord; coordIndex<points.length; coordIndex++ ) {
    // for( let coords of points ) {
      let coords = points[ coordIndex ];
      let lat = coords[ 1 ];
      let lon = coords[ 0 ];
      let radius = currentMpp/1000;

      try {
        let posts = yield query( lat, lon, radius );
        log.trace( 'Returned %d posts', posts.length );

        yield savePosts( posts );

      } catch( err ) {
        if( err.code==='ECONNREFUSED' ) {
          log.error( 'Cannot connect %s', err.message );
        }

        log.error( err, 'Query failed: %s', err.message );

      } finally {
        // Save state
        saveState( gridIndex, coordIndex );
      }
    }
    log.debug( 'Done grid %d', gridIndex );
    status.coord = 0; // Rest coodinates index
  }
  log.debug( 'Done all grids' );

  fs.unlinkSync( STATUS_FILE );
  closeMongo();
} )
.catch( function( err ) {
  log.fatal( err, 'NUOOOOOOOOO' );
  closeMongo();
} )
.then( function() {
  log.info( 'Bye' );
  process.exit( 0 );
} );

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78