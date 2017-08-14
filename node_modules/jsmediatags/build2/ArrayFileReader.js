'use strict';

var MediaFileReader = require('./MediaFileReader');

class ArrayFileReader extends MediaFileReader {

  constructor(array) {
    super();
    this._array = array;
    this._size = array.length;
    this._isInitialized = true;
  }

  static canReadFile(file) {
    return Array.isArray(file) || typeof Buffer === 'function' && Buffer.isBuffer(file);
  }

  init(callbacks) {
    setTimeout(callbacks.onSuccess, 0);
  }

  loadRange(range, callbacks) {
    setTimeout(callbacks.onSuccess, 0);
  }

  getByteAt(offset) {
    if (offset >= this._array.length) {
      throw new Error("Offset " + offset + " hasn't been loaded yet.");
    }
    return this._array[offset];
  }
}

module.exports = ArrayFileReader;