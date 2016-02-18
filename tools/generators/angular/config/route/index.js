'use strict';
var path = require('path');
var util = require('util');
var ScriptBase = require('../script-base.js');
var angularUtils = require('../util.js');


var Generator = module.exports = function Generator() {
  ScriptBase.apply(this, arguments);
  this.hookFor('angular:controller');
  this.hookFor('angular:view');
  // 21.05.2014 MB - pridano pro generovani souboru pro preklady
  this.translateTemplate('../json/translate.json', path.join('translations', 'cs-cz', this.name));
  this.translateTemplate('../json/translate.json', path.join('translations', 'en-us', this.name));
  this.translateTemplate('../json/translate.json', path.join('translations', 'sk-sk', this.name));
};

util.inherits(Generator, ScriptBase);

Generator.prototype.rewriteAppJs = function () {
  var coffee = this.env.options.coffee;
  var config = {
    file: path.join(
      this.env.options.appPath,
      'scripts/app.' + (coffee ? 'coffee' : 'js')
    ),
    needle: '.otherwise',
    splicable: [
      "  title: 'PAGE_TITLE'" + (coffee ? "" : "," ),
      "  templateUrl: 'views/" + this.name.toLowerCase() + ".html'" + (coffee ? "" : "," ),
      "  controller: '" + this.classedName + "Ctrl'"
    ]
  };

  if (coffee) {
    config.splicable.unshift(".when '/" + this.name + "',");
  }
  else {
    config.splicable.unshift(".when('/" + this.name + "', {");
    config.splicable.push("})");
  }

  angularUtils.rewriteFile(config);
};
