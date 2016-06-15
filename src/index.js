var fs = require('fs');
var replace = require('replacestream');
var UsageError = require('./UsageError');
var utils = require('./utils');


var bracketRegex = new RegExp('\\{([\\s\\S]*?)\\}','g');


module.exports = function injector() {

  if (arguments.length < 3) {
    throw new UsageError('Not enough arguments');
  }

  // convert to Array
  var args = Array.from(arguments);

  var target = args[0];
  var key = args[1];
  var globs;
  var options;

  var lastArg = args[args.length - 1];
  // options provided
  if (typeof lastArg === 'object') {
    globs = args.slice(2, args.length - 1);
    options = lastArg;
  }
  // options not provided
  else {
    globs = args.slice(2);
    options = utils.findOptionsFile();
  }

  var transforms = options.transforms || {};

  var startInject = '<!\\-\\-\\s*inject:' + key + '\\s*\\-\\->';
  var endInject = '<!\\-\\-\\s*endinject\\s*\\-\\->';
  var pattern = startInject + '([\\s\\S]*)' + endInject;
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

  fs.createReadStream(target)
  .pipe(replace(regex, fn))
  .pipe(process.stdout);

}
