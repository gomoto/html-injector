var fs = require('fs');
var replacestream = require('replacestream');
var UsageError = require('./UsageError');
var utils = require('./utils');


var bracketRegex = new RegExp('\\{([\\s\\S]*?)\\}','g');
var noop = Function.prototype;


function Injectable(instream) {
  this.instream = instream;
}


/**
 * @param  {string} tag
 * @param  {string[]} globs
 * @param  {Object} options
 * @return {Injectable} injectable
 */
Injectable.prototype.replace = function(tag, globs, options) {

  if (arguments.length < 2) {
    throw new UsageError('Not enough arguments');
  }

  if (!Array.isArray(globs)) {
    throw new UsageError('File globs must be an array');
  }

  options = options || utils.findOptionsFile();
  var transforms = options.transforms || {};

  var injectionTag = '<!\\-\\-\\s*' + tag + '\\s*\\-\\->';
  var pattern = injectionTag + '([\\s\\S]*?)' + injectionTag;
  var regex = new RegExp(pattern, 'g');

  // repeat template (stuff between the start and end tags) for each glob
  var fn = function() {

    var template = arguments[1];

    var results = utils.expandGlobs(globs).map((file) => {
      return template.replace(bracketRegex, function() {

        // Build array of transform functions, but don't call them yet.
        // Function may be undefined if it does not exist in transforms.

        var transformStrings = arguments[1].trim().split(/\s+/);

        var transformFunctions = transformStrings.map((transformString) => {
          if (transformString === 'path') {
            return () => { return file };
          }
          else if (transformString === 'content') {
            return () => { return fs.readFileSync(file, {encoding: 'utf8'}) };
          }
          else {
            return transforms[transformString];
          }
        });

        // Call all the transform functions. Return the net result.

        var transformation = '';

        transformFunctions.forEach((transformFunction, index) => {
          try {
            transformation = transformFunction(transformation);
          }
          catch (e) {
            console.warn('Bad transform:', transformStrings[index]);
          }
        });

        return transformation;

      });
    });

    return results.join('');

  };

  var outstream = this.instream.pipe(replacestream(regex, fn));
  return new Injectable(outstream);
};


/**
 * @param  {string} tag
 * @param  {Object} values
 * @param  {Object} options
 * @return {Injectable} injectable
 */
Injectable.prototype.replaceValues = function(tag, values, options) {

  var options = options || {};
  var transforms = options.transforms || {};

  var injectionTag = '<!\\-\\-\\s*' + tag + '\\s*\\-\\->';
  var pattern = injectionTag + '([\\s\\S]*?)' + injectionTag;
  var regex = new RegExp(pattern, 'g');

  // fill in template using values
  var fn = function() {

    var template = arguments[1];

    // Replace each bracket using the function.
    return template.replace(bracketRegex, function() {

      // Build array of transform functions, but don't call them yet.
      // Function may be undefined if it does not exist in transforms.

      var match = arguments[1];
      var tokens = match.trim().split(/\s+/);

      // Tokens may be values or transforms.
      // Convert values to transform functions.
      // Try finding token in values;
      // then try finding token in transforms.

      var transformFunctions = tokens.map((token) => {
        var value = values[token];
        if (typeof value !== 'undefined') {
          return () => { return value };
        }
        else {
          return transforms[token];
        }
      });

      // Call all the transform functions. Return the net result.

      var transformation = '';

      transformFunctions.forEach((transformFunction, index) => {
        try {
          transformation = transformFunction(transformation);
        }
        catch (e) {
          console.warn('Bad token:', tokens[index]);
        }
      });

      return transformation;

    });

  };

  var outstream = this.instream.pipe(replacestream(regex, fn));
  return new Injectable(outstream);
};


/**
 * @param  {string} outfile
 * @param  {Function} callback
 * @return {Injectable} injectable
 */
Injectable.prototype.write = function(outfile, callback) {

  var writestream, cb;

  switch(arguments.length) {
    case 0:
      writestream = process.stdout;
      cb = noop;
      break;
    case 1:
      if (typeof outfile === 'string') {
        writestream = fs.createWriteStream(outfile);
        cb = noop;
      }
      else {
        throw new UsageError('outfile must be a string. Cannot specify callback without outfile');
      }
      break;
    case 2:
      writestream = fs.createWriteStream(outfile);
      cb = callback;
      break;
    default:
      throw new UsageError('Invalid arguments passed to `write`');
  }

  this.instream.pipe(writestream).on('finish', cb);
  return new Injectable(this.instream);
};


module.exports = function inject(infile) {

  if (typeof infile !== 'string') {
    throw new UsageError('Infile must be a string');
  }

  var outstream = fs.createReadStream(infile);
  return new Injectable(outstream);
}
