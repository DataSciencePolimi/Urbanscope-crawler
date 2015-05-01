'use strict';
// Load system modules

// Load modules
import co from 'co';
import bunyan from 'bunyan';
import grid from 'node-geojson-grid';

// Load my modules
import { open as openMongo, close as closeMongo } from './model/';
import gridConfig from '../config/grid-config.json';
// import { query as twQuery } from './social/twitter';
// import { query as igQuery } from './social/instagram';


// Constant declaration


// Module variables declaration
let log = bunyan.createLogger( {
  name: 'cralwer',
  level: 'trace',
} );


// Module functions declaration
function* savePosts( posts ) {
  for( let post of posts ) {
    try {
      log.trace( 'Saving post %s', post.get( 'id' ) );
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
  /*
  let socialMap = {
    twitter: twQuery,
    instagram: igQuery,
  };
  let query = socialMap[ social ];
  */
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
} )
.catch( err => {
  log.fatal( err, 'NUOOOOOOOOO' );
} )
.then( () => {
  closeMongo();
  log.info( 'Bye' );
} );

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78