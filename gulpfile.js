/* *****************
#    DEFINE-VARS
# *************** */
var _ = require("underscore"),
  gulp = require("gulp"),
  exec = require("child_process").exec,
  mocha_phantomjs = require("gulp-mocha-phantomjs"),
  qunit = require("gulp-qunit");


/* ******************
#    CONCAT-TASKS
# **************** */
gulp.task("default", ["test", "lint"]);
gulp.task("test", [
    "test-backbone",
    "test-own"
]);


/* *********
#    TEST
# ******* */
gulp.task("test-backbone", function () {
  return gulp.src("backbone-test/index.html")
    .pipe(qunit());
});

gulp.task("test-own-crossbar", function (cb) {
  exec("crossbar start &");
  _.delay(cb, 10000);
});

gulp.task("test-own", ["test-own-crossbar"], function (cb) {
  var stream = mocha_phantomjs();
  stream.write({path: "http://127.0.0.1:9000/test/"});
  stream.end();
  return stream;
});


/* ***********
#    LINT
# ********* */
gulp.task("lint", function (cb) {
  cb();
});
