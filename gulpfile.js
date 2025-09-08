const { deleteAsync: del } = require('del');
const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const purgecss = require('gulp-purgecss');
const terser = require('gulp-terser');
const rename = require('gulp-rename');

// 配置路径（只处理assets下的自建文件）
const paths = {
  css: {
    src: 'assets/css/**/*.css',       // 源CSS文件（你的自建CSS）
    dest: 'assets/css/',              // 输出到同一个目录
    // backups: 'assets/css/backups/'    // 备份原始文件的目录
  },
  js: {
    src: 'assets/js/**/*.js',         // 源JS文件（你的自建JS）
    dest: 'assets/js/',               // 输出到同一个目录
    // backups: 'assets/js/backups/'     // 备份原始文件的目录
  },
  // 用于分析哪些CSS被使用的HTML文件
  html: '**/*.html'
};

// 1. 清理旧的压缩后文件，即把所有 .min.css 和 .min.js 文件删除
function cleanMin() {
  return del([
    paths.css.dest + '**/*.min.css',
    paths.js.dest + '**/*.min.js'
  ]);
}


// 3. 清理并压缩CSS
function optimizeCss() {
  return gulp.src(paths.css.src)
    // 移除未使用的CSS规则（基于HTML文件分析）
    .pipe(purgecss({
      content: [paths.html],
      // 保留可能动态使用的类名
      safelist: [
        /^article-category-/  // 保留所有文章分类相关类名
      ]
    }))
    // 压缩CSS
    .pipe(cleanCSS())
    // 重命名为 .min.css（不覆盖原始文件）
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.css.dest));
}

// 4. 压缩JS
function optimizeJs() {
  return gulp.src(paths.js.src)
    // 压缩并混淆JS
    .pipe(terser())
    // 重命名为 .min.js（不覆盖原始文件）
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.js.dest));
}

// 5. 主任务：先备份，再优化
const optimize = gulp.series(
  // 并行备份CSS和JS
  gulp.parallel(cleanMin),
  // 并行优化CSS和JS
  gulp.parallel(optimizeCss, optimizeJs)
);

// 暴露任务
exports.optimize = optimize;
exports.default = optimize; // 默认任务就是优化