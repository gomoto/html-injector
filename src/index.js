var fs = require('fs');
var replacestream = require('replacestream');
var UsageError = require('./UsageError');
var utils = require('./utils');



var bracketRegex = new RegExp('\\{([\\s\\S]*?)\\}','g');
var noop = Function.prototype;



/**
 * Replaces file content between each pair of tags with the specified tag type.
 * Transforms specified here take precedence over those from options file.
 * @param  {string} tag
 * @param  {Object<string, string | Function>} transforms
 * @param  {string[]} globs
 * @return {stream} a through stream
 */
module.exports = function HTMLInjector(tag, transforms, globs) {
  if (!tag) {
    throw new UsageError('tag is required');
  }

  transforms = Object.assign({}, utils.findOptionsFile().transforms, transforms);

  if (globs && !Array.isArray(globs)) {
    throw new UsageError('globs must be an array');
  }

  var injectionTag = '<!\\-\\-\\s*' + tag + '\\s*\\-\\->';
  var pattern = injectionTag + '([\\s\\S]*?)' + injectionTag;
  var tagRegex = new RegExp(pattern, 'g');
  var tagReplacement = createTagContentReplacementFunction(transforms, globs);
  return replacestream(tagRegex, tagReplacement);
};



/**
 * @param  {Object<string, string | Function>} transforms
 * @param  {string[]} globs
 * @return {Function} replacement function
 */
function createTagContentReplacementFunction(transforms, globs) {
  /**
   * Replacement function in the form of String.prototype.replace()
   * @param  {string} fullMatch
   * @param  {string} tagContent
   * @return {string} tagContent with transforms applied
   */
  return function(fullMatch, tagContent) {
    if (globs) {
      return utils.expandGlobs(globs).map((file) => {
        return tagContent.replace(bracketRegex, createBracketContentReplacementFunction(transforms, file));
      }).join('');
    } else {
      return tagContent.replace(bracketRegex, createBracketContentReplacementFunction(transforms));
    }
  };
}



/**
 * If file name is specified, two additional transforms are available:
 * $path and $content
 * @param  {Object<string, string | Function>} transforms
 * @param  {string} file (optional) file name
 * @return {Function} replacement function
 */
function createBracketContentReplacementFunction(transforms, file) {
  /**
   * Replacement function for String.prototype.replace()
   * @param  {string} fullMatch
   * @param  {string} bracketContent
   * @return {string} result of all transforms
   */
  return function(fullMatch, bracketContent) {
    var tokens = bracketContent.trim().split(/\s+/);

    // Build array of transform functions, but don't call them yet.
    // Function may be undefined if it does not exist in transforms.

    var transformFunctions = tokens.map((token) => {
      // special file transforms
      if (file && token === '$path') {
        return () => { return file };
      }
      if (file && token === '$content') {
        return () => { return fs.readFileSync(file, {encoding: 'utf8'}) };
      }

      var transform = transforms[token];
      if (typeof transform === 'function') {
        return transform;
      }
      else if (typeof transform === 'string') {
        return () => { return transform };
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
  };
}
