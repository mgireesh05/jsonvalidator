var nconf = require('nconf');

nconf.argv().env();
nconf.file("defaults", 'config.json');

module.exports = nconf;
