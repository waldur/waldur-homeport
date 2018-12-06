// Based on https://github.com/augusto-altman/angular-gettext-plugin/blob/master/index.js
// It allows to specify muliple glob patterns
'use strict';

const Compiler = require('./angular-gettext-compiler');
const Extractor = require('./angular-gettext-extractor');
const fs = require('fs');
const glob = require('glob');
const path = require('path');

function AngularGetTextPlugin(options) {
  this.compileTranslations = options.compileTranslations;
  this.extractStrings = options.extractStrings;
}

function compile(options) {
  // https://github.com/rubenv/grunt-angular-gettext/blob/master/tasks/compile.js#L7
  if (!Compiler.hasFormat(options.format)) {
    throw new Error('There is no "' + options.format + '" output format.');
  }

  const compiler = new Compiler({
    format: options.format
  });

  const filePaths = glob.sync(options.input);
  const outputs = filePaths.map( (filePath) => {
    const content = fs.readFileSync(filePath, options.encoding || 'utf-8');
    const fullFileName = path.basename(filePath);
    return {
      content: compiler.convertPo(content),
      fileName: path.basename(filePath, path.extname(fullFileName)) + '.' + options.format
    };
  } );

  return outputs;
}

AngularGetTextPlugin.prototype.apply = function(compiler) {
  const options = this;

  compiler.hooks.emit.tapAsync('AngularGettextPlugin', (compilation, done) => {
    if (options.compileTranslations) {
      const results = compile(options.compileTranslations);
      results.forEach( (result) => {
        const { fileName, content } = result;
        const outPath = path.join(options.compileTranslations.outputFolder, fileName);
        compilation.assets[outPath] = {
          source: function() {
            return content;
          },
          size: function() {
            return content.length;
          }
        };
      } );
    }

    if (options.extractStrings) {
      const extractor = new Extractor(options.extractStrings);

      options.extractStrings.patterns.forEach(pattern => {
        const filePaths = glob.sync(pattern);
        filePaths.forEach( (fileName) => {
          const content = fs.readFileSync(fileName, 'utf8');
          extractor.parse(fileName, content);
        });
      });
      fs.writeFileSync(options.extractStrings.destination, extractor.toString());
    }

    done();
  });
};

module.exports = AngularGetTextPlugin;
