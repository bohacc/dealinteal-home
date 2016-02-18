// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    preprocessors: {
      'app/views/directives/*.html': ['ng-html2js']
    },

    // list of files / patterns to load in the browser
    files: [
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',
      'app/bower_components/angular-animate/angular-animate.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/bower_components/angular-strap/dist/angular-strap.js',
      'app/bower_components/angular-socket-io/socket.js',
      'app/bower_components/angular-loading-bar/build/loading-bar.js',
      'app/bower_components/angular-translate/angular-translate.js',
      'app/bower_components/angular-translate-loader-partial/angular-translate-loader-partial.js',
      'app/bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
      'app/bower_components/angular-spinner/angular-spinner.js',
      'app/bower_components/moment/moment.js',
      'app/bower_components/angular-ui-calendar/src/calendar.js',
      'app/bower_components/fullcalendar/dist/fullcalendar.js',
      'app/bower_components/fullcalendar/dist/gcal.js',
      'app/bower_components/ng-file-upload/ng-file-upload.js',
      'app/bower_components/Chart.js/src/Chart.Core.js',
      'app/bower_components/Chart.js/src/Chart.Doughnut.js',
      'app/bower_components/angular-chart.js/dist/angular-chart.js',
      'app/bower_components/rangy/rangy-core.js',
      'app/bower_components/rangy/rangy-selectionsaverestore.js',
      //'app/bower_components/textAngular/dist/textAngular-rangy.min.js',
      'app/bower_components/textAngular/dist/textAngular-sanitize.min.js',
      'app/bower_components/textAngular/dist/textAngularSetup.js',
      'app/bower_components/textAngular/dist/textAngular.js',
      'app/scripts/*.js',
      'app/scripts/**/*.js',
      'app/views/directives/*.html',
      'app/views/*.html',
      //'test/mock/**/*.js',
      'test/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'], //, 'Firefox', 'Opera', 'Safari', 'IE'],

    plugins : [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-opera-launcher',
      'karma-safari-launcher',
      'karma-ie-launcher',
      'karma-jasmine',
      'karma-junit-reporter',
      'karma-html2js-preprocessor',
      'karma-ng-html2js-preprocessor'
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
