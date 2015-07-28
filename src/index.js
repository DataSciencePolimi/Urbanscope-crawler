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
let getLastID = require( './model/' ).getLastID;


// Constant declaration
const CONFIG_FOLDER = path.join( __dirname, '..', 'config' );
const GRID_FILE = path.join( CONFIG_FOLDER, 'generated-grids.json' );
const STATUS_FILE = path.join( CONFIG_FOLDER, 'status.json' );
const DATE_FILE = path.join( CONFIG_FOLDER, 'start-date.json' );
const QUEUE_CAPACITY = 50;
const WRAP_OPTS = {
  field: 'source',
};

// Module variables declaration
let queue = new Queue( QUEUE_CAPACITY );
let status = [];
let statusMap = {};
let options = {};
let log = bunyan.createLogger( {
  name: 'Crawler',
  level: 'trace',
} );


// Module functions declaration
function queuePost( post ) {
  queue.write( post );
}
function saveState( forcedStatus ) {
  // Use global status as default
  forcedStatus = forcedStatus || status;

  // Update the global status var
  status = forcedStatus;

  // Save to disk the status
  fs.writeFileSync( STATUS_FILE, JSON.stringify( status ), 'utf8' );
}
function updateStatus( socialId, index ) {
  let statusIndex = statusMap[ socialId ];
  status[ statusIndex ] = Number( index );

  saveState();
}
function saveStartDate() {
  let date = new Date();
  fs.writeFileSync( DATE_FILE, date.toJSON(), 'utf8' );
}
function getStartDate() {
  let strDate = fs.readFileSync( DATE_FILE, 'utf8' );
  return new Date( strDate );
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
    updateStatus( socialId, lastPoint );
  }
}
function run( crawler ) {

  // Start the crawling
  crawler.run( 'geo', options, status );
}
function ready( crawler, socialIds ) {
  _.each( socialIds, function( socialId, idx ) {
    statusMap[ socialId ] = idx;
  } );

  log.debug( 'Status map ', statusMap );
  log.info( 'Running first loop' );

  try {
    fs.accessSync( DATE_FILE, fs.F_OK );
    log.trace( 'Start date file present', getStartDate() );
  } catch( err ) {
    log.trace( 'Creating start date file' );
    saveStartDate();
  }

  options.since = getStartDate();

  // Start the crawler
  run( crawler );
}
function completed( crawler, runId ) {
  log.info( 'Run id "%s" completed, restarting', runId );
  // Save the last queued posts
  queue.forceSave();

  // Reset status
  status = _.fill( status, 0 );
  saveState();

  options.since = getStartDate();
  saveStartDate();

  run( crawler );
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

  let gridMapping = {};
  _.each( socials, function( social ) {
    if( social.grid ) {
      let indexes = _.isArray( social.grid.index ) ? social.grid.index : [ social.grid.index ];
      _.each( indexes, function( idx ) {
        gridMapping[ idx ] = gridMapping[ idx ] || {
          start: 0,
          count: 0,
        };
        gridMapping[ idx ].count += 1;
      } );
    }
  } );
  log.trace( { map: gridMapping }, 'Grid mapping' );

  _.each( socials, function( social ) {
    if( social.grid ) {
      let indexes = _.isArray( social.grid.index ) ? social.grid.index : [ social.grid.index ];
      let socialGrid = [];
      _.each( indexes, function( idx ) {
        let map = gridMapping[ idx ];
        let myGrid = grids[ idx ];
        let size = Math.floor( myGrid.length/map.count );
        let start = map.start;
        let end = start + size;
        log.trace( 'Grid %d( size %d) range: %d -> %d', idx, myGrid.length, start, end );
        socialGrid = socialGrid.concat( myGrid.slice( start, end ) );
        map.start = end;
        log.trace( 'Grid config mpp %d', gridConfig[ idx ].mpp );
      } );

      social.geojson = socialGrid;
      social.radius = _.sum( _( gridConfig )
      .pick( indexes )
      .map( 'mpp' )
      .value() )/indexes.length;
      log.trace( 'Social radius = %d', social.radius );
    }
  } );

  let crawler = new Crawler( socials );

  // Log related events
  let crawlerLogger = log.child( {
    component: 'Manager',
    // level: 'trace',
  } );
  crawler.on( 'log.trace', crawlerLogger.trace.bind( crawlerLogger ) );
  crawler.on( 'log.debug', crawlerLogger.debug.bind( crawlerLogger ) );
  crawler.on( 'log.info', crawlerLogger.info.bind( crawlerLogger ) );
  crawler.on( 'log.warn', crawlerLogger.warn.bind( crawlerLogger ) );
  crawler.on( 'log.error', crawlerLogger.error.bind( crawlerLogger ) );
  crawler.on( 'log.fatal', crawlerLogger.fatal.bind( crawlerLogger ) );

  // Data related events
  crawler.on( 'status', handleStatusUpdate );
  crawler.on( 'data', handleData );

  // Handle ready and completed events
  crawler.on( 'completed', _.partial( completed, crawler ) );
  crawler.once( 'ready', _.partial( ready, crawler ) );

} )
.catch( function( err ) {
  log.fatal( err, 'NUOOOOOOOOO' );
  closeMongo();
} )
;

process.on( 'uncaughtException', function( err ) {
  log.fatal( err, 'FUUUUUUU' );
  console.error( 'UNCAUGHT exception: ', err );
  process.exit( 1 );
} );

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78