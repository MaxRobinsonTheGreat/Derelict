function NoBulletsError() {
  let tmp = Error.apply(this.arguements);
  tmp.name = this.name = 'NoBulletsError';

  this.message = tmp.message;

  Object.defineProperty(this, 'stack', {
    get: function() {
      return tmp.stack;
    }
  });

  return this;
}

NoBulletsError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: NoBulletsError,
    writable: true,
    configuration: true
  }
});

module.exports = NoBulletsError;
