var fs = require('fs');
var globber = require('glob');
var replace = require('replacestream');
var UsageError = require('./UsageError');


module.exports = function injector() {

  if (arguments.length < 3) {
    throw new UsageError('Not enough arguments');
  }

  // convert to Array
  var args = Array.from(arguments);

  var target = args[0];
  var key = args[1];
  var globs = args.slice(2);

  var startInject = '<!\\-\\-\\s*inject:' + key + '\\s*\\-\\->';
  var endInject = '<!\\-\\-\\s*endinject\\s*\\-\\->';
  var pattern = startInject + '([\\s\\S]*)' + endInject;
  var regex = new RegExp(pattern, 'g');

  // repeat template for each glob
  var fn = function() {

    var template = arguments[1];

    var files = [];

    globs.forEach((glob) => {
      matches = globber.sync(glob);
      matches.forEach((match) => {
        files.push(match);
      });
    });

    var results = files.map((file) => {
      return template
      .replace('xxx', file)
      .replace('yyy', fs.readFileSync(file));
    });

    return results.join('');

  };

  fs.createReadStream(target)
  .pipe(replace(regex, fn))
  .pipe(process.stdout);

}
