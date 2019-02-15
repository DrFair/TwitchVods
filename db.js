'use strict';

const Datastore = require('nedb');
const path = require('path');

class NEDB {
  constructor() {
    this.dbFolder = process.env.STORAGE_PATH;
  }

  newDBPath(dbName) {
    return path.join(this.dbFolder, dbName + '.db');
  }

  newDatastore(dbName) {
    return new Datastore({ filename: this.newDBPath(dbName), autoload: true });
  }
}

module.exports = NEDB;
