/* *****************
#    DEFINE-VARS
# *************** */
var _ = require("underscore"),
  gulp = require("gulp"),
  coffee = require("gulp-coffee"),
  coffeelint = require("gulp-coffeelint"),
  exec = require("child_process").exec,
  mocha_phantomjs = require("gulp-mocha-phantomjs"),
  qunit = require("gulp-qunit"),
  sourcemaps = require("gulp-sourcemaps");


/* ******************
#    CONCAT-TASKS
# **************** */
gulp.task("default", ["test", "build"]);
gulp.task("test", [
    "test-backbone",
    "test-backbone-extend",
    "test-own"
]);
gulp.task("build", ["lint", "compile"]);


/* *********
#    TEST
# ******* */
gulp.task("test-backbone", function () {
  return gulp.src("backbone-test/index.html")
    .pipe(qunit());
});

gulp.task("test-backbone-extend-pre", function () {
  return gulp.src("backbone-test/model.coffee")
    .pipe(coffee())
    .pipe(gulp.dest("tmp/"));
});

gulp.task("test-backbone-extend", ["test-backbone-extend-pre"], function (cb) {
  exec("node tmp/model.js", function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
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
#    BUILD
# ********* */
gulp.task("lint", function () {
  return gulp.src(["*.coffee", "test/*.coffee"])
    .pipe(coffeelint())
    .pipe(coffeelint.reporter());
});
    
gulp.task("compile", function () {
  gulp.src("backbone.wamp.coffee")
    .pipe(sourcemaps.init())
    .pipe(coffee())
    .pipe(sourcemaps.write({
      includeContent: false,
      sourceRoot: "./"
    }))
    .pipe(gulp.dest("./"));

  return gulp.src("test/*.coffee")
    .pipe(sourcemaps.init())
    .pipe(coffee())
    .pipe(sourcemaps.write({
      includeContent: false,
      sourceRoot: "../../test"
    }))
    .pipe(gulp.dest("tmp/test/"));
});


/* ********
#    DEV
# ****** */
gulp.task("dev", function () {
  gulp.watch(["*.coffee", "test/*.coffee"], ["build"]);
});
