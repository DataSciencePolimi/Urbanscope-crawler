'use strict';
// Load system modules

// Load modules

// Load my modules

// Constant declaration
const MAX_ELEMENTS = 100;

// Module variables declaration

// Module functions declaration

// Module class declaration
function Queue( async, MAX ) {
  this.queue = [];
  this.MAX = MAX || MAX_ELEMENTS;
  this.count = 0;
  this.async = async;
}
Queue.prototype.enqueue = function* enqueueItem( item ) {
  this.queue.push( item );
  yield this.start();
};
Queue.prototype.start = function* queueStart() {
  if( this.count>this.MAX || this.queue.length===0 ) {
    return; // Limit reached, cannot process data
  }
  this.count += 1;
  yield this.async( this.queue.shift() );
  this.count -= 1;
  yield queueStart();
};

// Module initialization (at first load)

// Entry point
module.exports = Queue;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78