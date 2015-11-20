var gulp = require('gulp');
// gutil 工具, e.g. log error
var gutil = require('gulp-util');
// 删除文件，支持多个文件以及 globbing
var del = require('del');
// 多个文件合并为一个；
var concat = require('gulp-concat');
// 对文件名加MD5后缀
var rev = require('gulp-rev');
// 路径替换
var revCollector = require('gulp-rev-collector');
// js 压缩
var uglify = require('gulp-uglify');
// css 压缩
var minifyCss = require('gulp-minify-css');
// html 压缩
var htmlmin = require('gulp-htmlmin');
// 图片压缩
var imagemin = require('gulp-imagemin');
// 使用pngquant深度压缩png图片的imagemin插件
var pngquant = require('imagemin-pngquant');
// 图片缓存
var cache = require('gulp-cache');
// 使任务按顺序执行
var gulpSequence = require('gulp-sequence');

// htmlmin config
var htmlminOptions = {
    removeCommentsFromCDATA: true, // 删除HTML中 script 和 style 注释
    removeCDATASectionsFromCDATA: true, // 删除HTML中 CDATA 注释
    collapseWhitespace: true, // 删除连续的空格
    conservativeCollapse: true, // 配合 collapseWhitespace 一起使用
    preserveLineBreaks: true, // 删除换行，配合 collapseWhitespace 一起使用
    // collapseBooleanAttributes: true		// 删除值为 boolean 的属性
    // removeAttributeQuotes: true 			// 删除引号
    // removeRedundantAttributes			// 删除冗余属性
    // preventAttributesEscaping			// 防止逃跑的属性的值
    // useShortDoctype						// 使用 <!doctype html>
    // removeEmptyAttributes				// 删除空属性
    removeScriptTypeAttributes: true, // 删除 script 的 type="text/javascript" 属性
    removeStyleLinkTypeAttributes: true, // 删除 link 的 type="text/css" 属性
    // removeOptionalTags           		// 删除非必需的标签，例如 tbody
    // removeIgnored           				// 删除所有标签开头结尾，例如 < %,% >,< ?,? >
    // removeEmptyElements     				// 删除空标签
    // lint                 				// 切换 lint 检查
    // keepClosingSlash     				// 保证每个标签闭合
    // caseSensitive	     				// 以区分大小写的方式处理属性(用于自定义HTML标记。)
    minifyJS: true, // 压缩js(uses UglifyJS，可以配置 option)
    minifyCSS: true, // 压缩css(uses clean-css，可以配置 option)
    // minifyURLs			   				// 压缩URL(uses relateurl，可以配置 option)
    // ignoreCustomComments			   		// 忽略自定义注释
    // ignoreCustomFragments		   		// 忽略自定义代码片段
    processScripts: ['text/template'], // 需要压缩的 script 类型
    // maxLineLength				   		// 指定一个最大长度。压缩输出换行将分割的分割点有效的HTML。
    // customAttrAssign				   		// 支持自定义属性数组赋值表达式
    // customAttrSurround			   		// 支持自定义属性表达式
    // customAttrCollapse			   		// 正则表达式,指定自定义属性带换行
    // quoteCharacter				   		// 属性值使用 " 或 '
    removeComments: true // 删除HTML注释
};

// 清空文件
gulp.task('clean', function() {
    return del([
        'build/**/*',
        'assets/**/*'
    ]);
});

/***************************Build-Begin*****************************/
/*******************************************************************/

// 合并 script, 文件名加MD5后缀
gulp.task('script_concat', function() {
    return gulp.src('script/**/*.js')
        .pipe(concat('q.min.js'))
        .pipe(rev())
        .pipe(gulp.dest('build/script'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('build/rev/script'));
});

// 合并 style, 文件名加MD5后缀
gulp.task('style_concat', function() {
    return gulp.src('style/**/*.css')
        .pipe(concat('base.min.css'))
        .pipe(rev())
        .pipe(gulp.dest('build/style'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('build/rev/style'));
});

// test 替换文件名
gulp.task('test', function() {
    return gulp.src(['build/rev/**/*.json', 'test/**/*.html'])
        // 执行文件内 script, style 名的替换
        .pipe(revCollector())
        // 替换后的文件输出的目录
        .pipe(gulp.dest('build/test'));
});

// dome 替换文件名
gulp.task('dome', function() {
    return gulp.src(['build/rev/**/*.json', 'dome/**/*.html'])
        // 执行文件内 script, style 名的替换
        .pipe(revCollector())
        // 替换后的文件输出的目录
        .pipe(gulp.dest('build/dome'));
});


/***************************Build-End*******************************/
/*******************************************************************/




/***************************Assets-Begin****************************/
/*******************************************************************/

// 压缩 html
gulp.task('htmlmin', function() {
    return gulp.src('build/**/*.html')
        .pipe(htmlmin(htmlminOptions))
        .pipe(gulp.dest('assets'));
});

// 压缩 script
gulp.task('uglifyJS', function() {
    return gulp.src('build/script/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('assets/script'));
});

// 压缩 style
gulp.task('minifyCss', function() {
    return gulp.src('build/style/**/*.css')
        .pipe(minifyCss())
        .pipe(gulp.dest('assets/style'));
});

// 压缩图片
gulp.task('miniImage', function() {
    gulp.src('images/*.{png,jpg,gif,ico}')
        .pipe(cache(imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
            use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
        })))
        .pipe(gulp.dest('build/images'))
        .pipe(gulp.dest('assets/images'));
});

/***************************Assets-End******************************/
/*******************************************************************/

gulp.task('q', function(cb) {
    gulpSequence('clean', ['script_concat', 'style_concat'], ['dome', 'test'], ['htmlmin', 'uglifyJS', 'minifyCss', 'miniImage'])(cb);
});
