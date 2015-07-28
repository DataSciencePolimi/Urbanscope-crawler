'use strict';
// Load system modules
let Writable = require( 'stream' ).Writable;
let util = require( 'util' );

// Load modules
let tag = require( 'turf-tag' );
let fc = require( 'turf-featurecollection' );
let point = require( 'turf-point' );
let _ = require( 'lodash' );

// Load my modules
let getCollection = require( './model/' ).getCollection;
let nils = require( '../config/nils.json' );

// Constant declaration
const MAX_ELEMENTS = 100;

// Module variables declaration

// Module functions declaration

// Module class declaration
function Queue( MAX ) {
  Writable.call( this, {
    objectMode: true,
    decodeStrings: false,
  } );
  this.queue = [];
  this.MAX = MAX || MAX_ELEMENTS;
}
util.inherits( Queue, Writable );
Queue.prototype.save = function( queue ) {
  console.log( 'Saving queue length %d', queue.length );

  let posts = this.addNilToPosts( queue );


  getCollection()
  .insertMany( posts, {
    keepGoing: true,
  } )
  /*
  let batch = getCollection().initializeUnorderedBulkOp();
  for( let post of posts ) {
    batch.insert( post );
  }
  batch
  .execute()
  */


  .then( function( res ) {
    console.log( 'Saved %d', res.ops.length );
  } )
  .catch( function( err ) {
    console.error( 'Save error: ', err );
  } );
};
Queue.prototype.forceSave = function() {
  let q = this.queue;
  this.queue = [];
  this.save( q );
};
Queue.prototype.toGeoPoint = function( post, index ) {
  return point( post.location.coordinates, {
    index: index
  } );
};
Queue.prototype.getNilForPosts = function( posts ) {
  // Map coordinates to GeoJSON Point
  let mappedPoints = _.map( posts, this.toGeoPoint );

  // Create a feature collection, to be used with TURF
  let fcPoints = fc( mappedPoints );

  // Tag all the points with the corresponding nil
  let taggedPoints = tag( fcPoints, nils, 'ID_NIL', 'nil' );

  return taggedPoints;
};
Queue.prototype.addNilToPosts = function( posts ) {
  let validPosts = _.filter( posts, 'location.coordinates' );

  let taggedPoints = this.getNilForPosts( validPosts );

  return _.map( taggedPoints.features, function( featPoint ) {
    let index = Number( featPoint.properties.index );
    let nil = Number( featPoint.properties.nil );
    let post = validPosts[ index ];

    post.nil = nil;
    return post;
  } );
};
Queue.prototype._write = function( data, enc, cb ) { // eslint-disable-line no-underscore-dangle
  this.queue.push( data );

  if( this.queue.length>this.MAX ) {
    this.forceSave();
  }

  return cb();
};
// Module initialization (at first load)

// Entry point
module.exports = Queue;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78