'use strict';
// Load system modules

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

// Module class declaration


// Module initialization (at first load)


// Entry point
co( function*() {

  // Setup mongo
  yield openMongo();


  // Create the grid points
  log.debug( 'Generating point grids' );
  let fc = grid.json( gridConfig );
  let grids = fc.features.map( f => f.geometry.coordinates );
  log.trace( 'Generated %d grids', grids.length );

  // Load social
  let social = process.argv[ 2 ];
  log.trace( 'Loading module "%s"', social );
  let { query } = require( './social/'+social );

  // Cycle over the grids
  for( let idx=0; idx<gridConfig.length; idx++ ) {
    let currentMpp = gridConfig[ idx ].mpp;
    let points = grids[ idx ];
    log.debug( 'Current grid %d with %d points', idx, points.length );

    for( let coords of points ) {
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

      }
    }
    log.debug( 'Done grid %d', idx );
  }
  log.debug( 'Done all grids' );
  closeMongo();
} )
.catch( err => {
  log.fatal( err, 'NUOOOOOOOOO' );
  closeMongo();
  log.info( 'Bye' );
} );

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78