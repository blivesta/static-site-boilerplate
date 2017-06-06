import browserSync, {
  reload,
  stream
} from 'browser-sync'
import cached from 'gulp-cached'
import changed from 'gulp-changed'
import del from 'del'
import ejs from 'gulp-ejs'
import fs from 'fs'
import gulp from 'gulp'
import gulpIf from 'gulp-if'
import htmlmin from 'gulp-htmlmin'
import image from 'gulp-image'
import path from 'path'
import plumber from 'gulp-plumber'
import postcss from 'gulp-postcss'
import rename from 'gulp-rename'
import runSequence from 'run-sequence'
import size from 'gulp-size'
import sourcemaps from 'gulp-sourcemaps'
import Svgpack from 'svgpack'
import through from 'through2'
import webpack from 'webpack'
import webpackStream from 'webpack-stream'

import config, { envProduction } from './config'
import postcssConfig from './postcss.config'
import webpackConfig from './webpack.config.babel'

const errHandler = function (err) {
  console.log(err)
  this.emit('end')
}

// CSS
// =====================================================
gulp.task('css', () => {
  return gulp
    .src([
      `${config.dirs.src}/css/app.css`,
      `${config.dirs.src}/css/editor-style.css`
    ])
    .pipe(plumber({ errorHandler: errHandler }))
    .pipe(gulpIf(!envProduction, sourcemaps.init()))
    .pipe(postcss(postcssConfig))
    .pipe(gulpIf(!envProduction, sourcemaps.write('.')))
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest(`${config.dirs.dest}/css`))
    .pipe(stream({match: '**/*.css'}))
})

// JavaScript
// =====================================================
gulp.task('webpack', () => {
  return gulp
    .src('')
    .pipe(plumber({ errorHandler: errHandler }))
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(webpackConfig.output.path))
    .pipe(stream({
      once: true,
      match: '**/*.js'
    }))
})

// Image
// =====================================================
gulp.task('image', () => {
  return gulp
    .src([
      `${config.dirs.src}/**/*.{png,jpg,gif,svg}`,
      `!${config.dirs.src}/svg-icon/*.svg` // exclude
    ])
    .pipe(changed(`${config.dirs.dest}`))
    .pipe(image())
    .pipe(size())
    .pipe(gulp.dest(`${config.dirs.dest}`))
})

// SVG
// =====================================================
gulp.task('svg', () => {
  const svg = new Svgpack(`${config.dirs.src}/svg-icon/*.svg`, {
    dest: config.dirs.svgpack
  })
  return gulp
    .src('')
    .pipe(cached('build-svgpack'))
    .pipe(changed(config.dirs.svgpack))
    .pipe(through.obj((chunk, enc, cb) => {
      // svgpack
      cb(svg.init(), chunk)
    }))
    .on('end', () => {
      // file name change `svgpack-sprite.svg` => `icon-sprite.php`
      return gulp
        .src(`${config.dirs.svgpack}/svgpack-sprite.svg`)
        .pipe(changed(`${config.dirs.dest}/template-parts`, {
          transformPath: () => path.join(__dirname, `${config.dirs.dest}/template-parts/svgpack-sprite.php`)
        }))
        .pipe(rename('svgpack-sprite.php'))
        .pipe(size({ showFiles: true }))
        .pipe(gulp.dest(`${config.dirs.dest}/template-parts`))
        .on('end', () => {
          // svg-icon copy
          return gulp
            .src([`${config.dirs.svgpack}/svg/*.svg`])
            .pipe(changed(`${config.dirs.dest}/svg-icon`))
            .pipe(size({ showFiles: true }))
            .pipe(gulp.dest(`${config.dirs.dest}/svg-icon`))
        })
    })
})

// ejs
// =====================================================
gulp.task('ejs', () => {
  const pages = JSON.parse(fs.readFileSync('./pages.json'))

  return gulp
    .src([
      'src/**/*.ejs',
      '!' + 'src/**/_*.ejs',
      '!' + 'src/**/~*.ejs'
    ])
    .pipe(ejs(pages))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulpIf(envProduction, htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('dest/'))
})

// Copy
// =====================================================
gulp.task('copy', () => {
  return gulp
    .src([
      `${config.dirs.src}/**/*.{php,md,txt}`,
      `!${config.dirs.src}/~**/*.{php,md,txt}`, // exclude
      `!${config.dirs.src}/**/~*.{php,md,txt}`  // exclude
    ], {
      base: config.dirs.src
    })
    .pipe(changed(config.dirs.dest))
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest(config.dirs.dest))
})

// Cleanup
// =====================================================
gulp.task('cleanup', (cb) => {
  return del([
    config.dirs.dest,
    config.dirs.svgpack,
    config.dirs.styleguide
  ], cb)
})

// Server
// =====================================================
gulp.task('server', () => {
  return browserSync.init({
    open: 'external',
    server: {
      baseDir: `./dest`
    }
  })
})

// Watch
// =====================================================
gulp.task('watch', () => {
  gulp.watch(['src/**/*.ejs'], ['ejs'])

  gulp.watch([
    `${config.dirs.src}/**/*.{png,jpg,gif,svg}`,
    `!${config.dirs.src}/svg-icon/*.svg` // exclude
  ], ['image'])

  gulp.watch([`${config.dirs.src}/css/*.css`], ['css'])
  gulp.watch([`${config.dirs.src}/svg-icon/*.svg`], ['svg'])
  gulp.watch([`${config.dirs.src}/js/**/*.js`], ['webpack'])
  //
  // // reload
  gulp.watch([`${config.dirs.dest}/**/*.{html,svg,png,jpg,gif}`]).on('change', reload)
})

// Default
// =====================================================
gulp.task('default', (cb) => {
  return runSequence(
    ['build'],
    'watch',
    'server',
    cb
  )
})

// Build
// =====================================================
gulp.task('build', (cb) => {
  return runSequence(
    ['copy'],
    'svg',
    'image',
    'ejs',
    'css',
    'webpack',
    cb
  )
})

// ReBuild
// =====================================================
gulp.task('rebuild', (cb) => {
  return runSequence(
    ['cleanup'],
    'default',
    cb
  )
})
