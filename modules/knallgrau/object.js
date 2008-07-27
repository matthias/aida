
/**
 * Returns a copy of this objects with all members, 
 * where the key matches the pattern.
 * @param {RegExp} pattern  Regular expression, which has to match the key.
 * @return {Object} The resulting object.
 */
Object.prototype.selectByKey = function(pattern) {
   var r = {};
   for (var key in this) {
      if (key.match(pattern)) { r[key] = this[key] }
   }
   return r;
}
Object.prototype.dontEnum("selectByKey");


/**
 * Returns a copy of this objects with just the members,
 * where the key does not match the pattern.
 * @param {RegExp} pattern  Regular expression, which must not match the key.
 * @return {Object} The resulting object.
 */
Object.prototype.rejectKeys = function(pattern) {
   var r = Object.clone(this);
   for (var key in this) {
      if (key.match(pattern)) { delete r[key] }
   }
   return r;
}
Object.prototype.dontEnum("rejectKeys");
