var request = require('request');
var fs = require('fs');
var tempFile = "temp.html";

var extractJSON = function() {

   var rl = require('readline').createInterface({
      input: require('fs').createReadStream(tempFile)
   });

   var lineNos = [];
   var lineNumber = 0;

   rl.on('line', function(line) {
      lineNumber++;
      if ((-1 != line.indexOf('{')) || (-1 != line.indexOf('['))) {
         lineNos.push(lineNumber);
      }
   });

   rl.on('close', function() {
      console.info("Potential JSON objects at lines: ", lineNos);
      console.info("Total = ", lineNos.length);
   });
};

var processUrl = function(url) {
   request.get(url).on('error', function(err) {
      console.error(err);
   }).pipe(fs.createWriteStream(tempFile).on('finish', function() {
      console.info('done');
      extractJSON();
   }));
};

var url = "https://github.com/docker/docker/blob/master/docs/reference/api/docker_remote_api_v1.0.md";

processUrl(url);
//extractJSON();
