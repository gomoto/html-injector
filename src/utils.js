var optionsFileName = 'hi.js';

module.exports = {

  findOptionsFile: function() {
    // Try to find options in current directory.
    // NPM scripts always run from project root.
    var options;
    try {
      options = require(process.cwd() + '/' + optionsFileName);
      // TODO: validate
    }
    catch (e) {
      options = {};
    }
    return options;
  }

}
