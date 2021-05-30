
let gulp = require("gulp");
let browserify = require("browserify");
let source = require("vinyl-source-stream");
let tsify = require("tsify");

gulp.task("default", function () {
    return browserify("Interpreter.ts", {
        basedir: ".",
        standalone: "Interpreter",
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .bundle()
    .pipe(source("Interpreter.js"))
    .pipe(gulp.dest("wwwroot/js"));
});
