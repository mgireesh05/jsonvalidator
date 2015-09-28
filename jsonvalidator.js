var request = require('request');
var fs = require('fs');
var BufferBuilder = require('buffer-builder');
var tempFile = "temp.html";

var extractJSON = function() {

   var rl = require('readline').createInterface({
      input: require('fs').createReadStream(tempFile)
   });

   var lineNos = [];
   var lineNumber = 0;
   var jsonStart = false;
   var jsonBuf;

   rl.on('line', function(line) {
      lineNumber++;
      if ((!jsonStart) && (-1 != line.indexOf('['))) {
         jsonStart = true;
         jsonBuf = new BufferBuilder();
      }
      if (jsonStart) {
         jsonBuf.appendString(line);
         lineNos.push(lineNumber);
         if ((line.indexOf(']') >= 0)) {
            jsonStart = false;
            var jsonObj = jsonBuf.get().toString();
            try {
               var json = JSON.parse(jsonObj);
               console.info("====Valid Json====");
               console.info(json);
               console.info("==================");
            } catch (e) {
               console.error("Invalid JSON: ", e);
            }
         }
      }
   });

   rl.on('close', function() {
      console.info("Done!");
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
