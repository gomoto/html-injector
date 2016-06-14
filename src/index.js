var UsageError = require('./UsageError');

module.exports = function injector() {

  if (arguments.length < 3) {
    throw new UsageError('Not enough arguments');
  }

  console.log(arguments);

}
