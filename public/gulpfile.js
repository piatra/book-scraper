var gulp = require('gulp');
var react = require('gulp-react');

gulp.task('default', function () {
  return gulp.src('public/app.jsx')
		.pipe(react())
		.pipe(gulp.dest('.'));
});
