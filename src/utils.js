var globber = require('glob');

var optionsFileName = 'hi.js';

module.exports = {

  expandGlobs: function(globs) {
    var files = [];
    globs.forEach((glob) => {
      globber.sync(glob).forEach((match) => {
        files.push(match);
      });
    });
    return files;
  },

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
