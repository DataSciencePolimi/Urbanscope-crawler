'use strict';
// Load system modules
let fs = require( 'fs' );
let path = require( 'path' );

// Load modules
let co = require( 'co' );
let bunyan = require( 'bunyan' );
let _ = require( 'lodash' );
let grid = require( 'node-geojson-grid' );
let wrap = require( '@volox/social-post-wrapper' );
let Crawler = require( '@volox/social-crawler' );

// Load my modules
let Queue = require( './queue.js' );
let gridConfig = require( '../config/grid-config.json' );
let socials = require( '../config/socials.json' );
let openMongo = require( './model/' ).open;
let closeMongo = require( './model/' ).close;


// Constant declaration
const CONFIG_FOLDER = path.join( __dirname, '..', 'config' );
const GRID_FILE = path.join( CONFIG_FOLDER, 'generated-grids.json' );
const STATUS_FILE = path.join( CONFIG_FOLDER, 'status.json' );
const QUEUE_CAPACITY = 50;
const WRAP_OPTS = {
  field: 'source',
};

// Module variables declaration
let queue = new Queue( QUEUE_CAPACITY );
let status = [];
let statusMap = {};
let log = bunyan.createLogger( {
  name: 'Crawler',
  level: 'trace',
} );


// Module functions declaration
function queuePost( post ) {
  queue.write( post );
}
function saveState( socialId, index ) {
  let statusIndex = statusMap[ socialId ];
  status[ statusIndex ] = Number( index );

  // TODO fix status file
  fs.writeFileSync( STATUS_FILE, JSON.stringify( status ), 'utf8' );
}
function handleData( socialId, data ) {
  let social = socialId.split( '_' )[ 0 ];
  let post = wrap( data, social, WRAP_OPTS );
  // TODO handle incoming data
  log.debug( 'Data recieved {%s}[%s]', socialId, post.id );

  queuePost( post );
}
function handleStatusUpdate( socialId, message, info, args ) {
  // TODO handle status updates
  log.trace( 'Status update for {%s}: %s-%s', socialId, message, info, args );

  if( message==='done' && info==='grid' ) {
    let lastPoint = args.end;
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

  try {
    status = require( STATUS_FILE );
    log.trace( 'Current status: ', status );
  } catch( err ) {
    // log.error( err );
  }

  // Map the social configuration to Crawler specific properties
  socials.forEach( function( social ) {
    // Get grid config
    let gridCfg = social.grid;

    // Map from "gridIndex" property to corresponding generated grid
    let currentGrid = [];
    if( _.isArray( gridCfg.index ) ) {
      let mpp = 0;
      for( let i=0; i<gridCfg.index.length; i++ ) {
        let index = gridCfg.index[ i ];
        mpp += gridConfig[ index ].mpp;
        currentGrid = currentGrid.concat( grids[ index ] );
      }
      social.radius = mpp/gridCfg.index.length; // Mean of the radiuses
    } else {
      currentGrid = grids[ gridCfg.index ];
      social.radius = gridConfig[ gridCfg.index ].mpp;
    }
    let half = Math.floor( currentGrid.length/2 );
    if( gridCfg.from==='half' ) gridCfg.from = half;
    if( gridCfg.to==='half' ) gridCfg.to = half;

    social.geojson = currentGrid.slice( gridCfg.from, gridCfg.to );
    // social.paginate = true; // FUUUK

    log.trace( 'Social %s for %s have a %d points grid', social.provider, social.id, social.geojson.length );
  } );

  let crawler = new Crawler( socials );
  function runLoop() {
    if( _.isArray( arguments[ 0 ] ) ) {
      _.each( arguments[ 0 ], function( socialId, idx ) {
        statusMap[ socialId ] = idx;
      } );

      log.debug( 'Status map ', statusMap );
      log.info( 'Running first loop' );
    } else {
      log.info( 'Run "%s" completed, restarting', arguments[ 0 ] );
      status = status.map( function() { return 0; } );
      process.exit( 0 );
    }

    // Start the crawling
    crawler.run( 'geo', {
      // MAX_PAGES: Infinity,
    }, status );
  }

  // Log related events
  let crawlerLogger = log.child( {
    component: 'Manager',
    level: 'info',
  } );
  crawler.on( 'log.trace', crawlerLogger.trace.bind( crawlerLogger ) );
  crawler.on( 'log.debug', crawlerLogger.debug.bind( crawlerLogger ) );
  crawler.on( 'log.info', crawlerLogger.info.bind( crawlerLogger ) );
  crawler.on( 'log.warn', crawlerLogger.warn.bind( crawlerLogger ) );
  crawler.on( 'log.error', crawlerLogger.error.bind( crawlerLogger ) );
  crawler.on( 'log.fatal', crawlerLogger.fatal.bind( crawlerLogger ) );

  // Data related events
  crawler.on( 'status', handleStatusUpdate );
  crawler.on( 'completed', runLoop );
  crawler.on( 'data', handleData );
  crawler.once( 'ready', runLoop );

} )
.catch( function( err ) {
  log.fatal( err, 'NUOOOOOOOOO' );
  closeMongo();
} )
;

process.on('uncaughtException', function( err ) {
  console.error( 'UNCAUGHT exception: ', err );
  log.fatal( err, 'FUUUUUUU' );
  process.exit( 1 );
} );

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78