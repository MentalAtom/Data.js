beforeEach(function() {
  this.addMatchers({
    toHaveTypeOf: function (type) {
        return typeof this.actual === type;
    },
    toHaveLengthOf: function (length) {
        return this.actual.length === length;
    }
  });
});
