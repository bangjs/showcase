var gulp = require('gulp');

var through2 = require('through2');

var nunjucks = require('nunjucks');
nunjucks.configure({
	watch: false
});


gulp.task('html', function () {

	return gulp.src('templates/v*.html').
		pipe(through2.obj(function (file, enc, cb) {

			file.contents = new Buffer(nunjucks.renderString(file.contents.toString()));
			
			this.push(file);
			cb();

		})).
		pipe(
			gulp.dest('.')
		);

});

gulp.task('default', ['html']);