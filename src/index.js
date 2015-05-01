'use strict';
// Load system modules

// Load modules
import co from 'co';
import bunyan from 'bunyan';
import grid from 'node-geojson-grid';

// Load my modules
import initMongo from './model/';
import gridConfig from '../config/grid-config.json';
import { query } from './social/twitter';
// import instagramApi from './social/instagram';


// Constant declaration


// Module variables declaration
let log = bunyan.createLogger( {
  name: 'cralwer',
  level: 'trace',
} );


// Module functions declaration
function* savePosts( posts ) {
  for( let post of posts ) {
    log.trace( 'Saving post %s', post.get( 'id' ) );
    yield post.save();
  }
}

// Module class declaration


// Module initialization (at first load)



// Entry point
log.debug( 'Generating point grids' );
let fc = grid.json( gridConfig );
let grids = fc.features.map( f => f.geometry.coordinates );
log.trace( 'Generated %d grids', grids.length );


co( function*() {

  // Setup mongo
  yield initMongo();

  for( let idx=0; idx<gridConfig.length; idx++ ) {
    let currentMpp = gridConfig[ idx ].mpp;
    let points = grids[ idx ];
    log.trace( 'Current grid: %d with %d points', idx, points.length );

    for( let coords of points ) {
      let lat = coords[ 1 ];
      let lon = coords[ 0 ];
      let radius = currentMpp/1000;
      let posts = yield query( lat, lon, radius );
      log.trace( 'Returned %d posts', posts.length );

      yield savePosts( posts );
    }
  }
} );

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78