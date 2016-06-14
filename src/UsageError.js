function UsageError(message) {
  this.name = 'UsageError';
  this.message = message || 'Bad usage';
  this.stack = (new Error()).stack;
}

UsageError.prototype = Object.create(Error.prototype);
UsageError.prototype.constructor = UsageError;

module.exports = UsageError;
