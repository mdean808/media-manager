const electron = require('electron');
const mainProcess = electron.remote.require('./main.js');

const mm = require('music-metadata');
const path = require('path');
const fs = require('fs').promises;
const Nanobar = require('nanobar');
const $ = require('jquery');
const Materialize = require('materialize-css');

let nanobar;

