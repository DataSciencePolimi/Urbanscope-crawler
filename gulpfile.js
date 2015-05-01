var path = require( 'path' );
var gulp = require( 'gulp' );
var sourcemaps = require( 'gulp-sourcemaps' );
var babel = require( 'gulp-babel' );

var SOURCE_DIR = path.join( __dirname, 'src/**/*' );
var DESTINATION_DIR = path.join( __dirname, 'dist' );

gulp.task( 'compile', function() {
  return gulp.src( SOURCE_DIR )
    .pipe( sourcemaps.init() )
    .pipe( babel() )
    .pipe( sourcemaps.write( '.' ) )
    .pipe( gulp.dest( DESTINATION_DIR ) );
} );

gulp.task( 'watch', function() {
  return gulp.watch( SOURCE_DIR, [ 'compile' ] );
} );


gulp.task( 'default', [ 'compile', 'watch' ] );