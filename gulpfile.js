const gulp = require("gulp");
const notify = require("gulp-notify"); // エラー通知
const plumber = require("gulp-plumber"); // エラー時のタスク停止防止
const debug = require("gulp-debug"); // ログ表示
const dartSass = require("gulp-dart-sass");
const autoprefixer = require("gulp-autoprefixer"); // ベンダープレフィックス付与
const sourcemaps = require("gulp-sourcemaps"); // ソースマップ出力
const cached = require("gulp-cached"); // ファイルキャッシュ
const cleancss = require("gulp-clean-css");
// const connect = require("gulp-connect");
const browserSync = require("browser-sync").create();

const paths = {
  scss: {
    src: "src/scss/**/*.scss", // コンパイル対象
    dest: "public/css", // 出力先
  },
  root: "./",
  html: {
    src: "./*.html",
    dest: "./dist/",
  },
};

/**
 * scssタスクで実行する関数
 */
function scss() {
  return gulp
    .src(paths.scss.src)
    .pipe(
      plumber({
        errorHandler: notify.onError("Error: <%= error.message %>"),
      })
    )
    .pipe(cached("scss")) // ファイルをキャッシュ

    .pipe(sourcemaps.init())
    .pipe(
      dartSass({
        outputStyle: "expanded",
      })
    )
    .pipe(
      autoprefixer({
        cascade: true,
      })
    )
    .pipe(cleancss())
    .pipe(sourcemaps.write("/maps"))
    .pipe(gulp.dest(paths.scss.dest))
    .pipe(debug({ title: "scss dest:" }));
}

/**
 * scssファイルをキャッシュする関数
 */
function scssCache() {
  return gulp
    .src(paths.scss.src)
    .pipe(cached("scss")) // ファイルをキャッシュさせる
    .pipe(debug({ title: "scss cached:" }));
}

// ブラウザ更新&ウォッチタスク
const browserSyncOption = {
  port: 8080,
  server: {
    baseDir: "./",
    index: "index.html",
  },
  reloadOnRestart: true,
};
function browsersync(done) {
  browserSync.init(browserSyncOption);
  done();
}

function watchFiles(done) {
  const browserReload = () => {
    browserSync.reload();
    done();
  };
  gulp.watch(paths.scss.src).on("change", gulp.series(scss, browserReload));
  gulp.watch(paths.html.src).on("change", gulp.series(browserReload));
}

exports.scss = scss; // scssタスク
exports.watch = gulp.series(scssCache, browsersync, watchFiles); // watchタスク
exports.default = gulp.series(scss); // defaultタスク
