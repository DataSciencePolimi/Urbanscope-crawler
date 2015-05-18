'use strict';
// Load system modules
import fs from 'fs';
import path from 'path';

// Load modules
import co from 'co';
import bunyan from 'bunyan';
import turf from 'turf';
import grid from 'node-geojson-grid';

// Load my modules
import Post from './model/post';
import { open as openMongo, close as closeMongo } from './model/';
import gridConfig from '../config/grid-config.json';
import nils from '../config/nils.json';


// Constant declaration
const GRID_FILE = path.join( __dirname, '..', 'config', 'generated-grids.json' );
const STATUS_FILE = path.join( __dirname, '..', 'config', 'status.json' );

// Module variables declaration
let log = bunyan.createLogger( {
  name: 'cralwer',
  level: 'trace',
} );


// Module functions declaration
function* savePosts( posts ) {
  let points = turf.featurecollection( posts.map( (p,index) => {
    return turf.point( p.location.coordinates, { index } );
  } ) );

  let taggedPoints = turf.tag( points, nils, 'ID_NIL', 'nil' );

  for( let point of taggedPoints.features ) {
    try {
      let { index, nil } = point.properties;
      let rawPost = posts[ index ];

      // Set the nil
      rawPost.nil = nil;

      // Create and save the post
      let post = new Post( rawPost );
      yield post.save();

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
    grid,
    coord,
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
  yield openMongo();

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
    grids = fc.features.map( f => f.geometry.coordinates );
    log.trace( 'Generated %d grids', grids.length );

    let json = JSON.stringify( grids, null, 2 );

    fs.writeFileSync( GRID_FILE, json, 'utf8' );
  }


  // Load social
  let social = process.argv[ 2 ];
  log.trace( 'Loading module "%s"', social );
  let { query } = require( './social/'+social );


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
  closeMongo();
} )
.catch( err => {
  log.fatal( err, 'NUOOOOOOOOO' );
  closeMongo();
} )
.then( ()=> {
  log.info( 'Bye' );
  process.exit(0);
} );

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78