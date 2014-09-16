var gulp = require('gulp');
var less = require('gulp-less');
var webserver = require('gulp-webserver');
var clean = require('gulp-clean');

var config = {
  devServer: {
    port: 8000,
    livereload: true,
    directoryListing: true,
    //this is the default file to be served
    //fallback: 'index.html'
  }
};

/* Delete compiled css files */
gulp.task('clean-css', function(){
  return gulp.src('app/css/*.css')
    .pipe(clean());
});
/* Compile less to css */
gulp.task('build-less', ['clean-css'], function(){
  return gulp.src(['app/css/main.less'])
    .pipe(less({compress: true}))
    .pipe(gulp.dest('app/css'));
});
/*Watch for changes in less sources */
gulp.task('watch-less',['build-less'], function(){
  gulp.watch('app/css/**/*.less', ['build-less']);
});


gulp.task('serve',['watch-less'], function(){
  gulp.src('app')
    .pipe(webserver(config.devServer));
});



gulp.task('default', ['serve'], function(){
});