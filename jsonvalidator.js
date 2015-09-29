var request = require('request');
var fs = require('fs');
var BufferBuilder = require('buffer-builder');
var tempFile = "temp.html";

var extractJSON = function() {

   var rl = require('readline').createInterface({
      input: require('fs').createReadStream(tempFile)
   });

   var lineNumber = 0;
   var jsonStart = false;
   var jsonBuf;
   var validJsonCount = 0;
   var invalidJsonCount = 0;
   var endChar = null;

   rl.on('line', function(line) {
      lineNumber++;
      if (!jsonStart) {
         var startChar1 = line.indexOf('[');
         var startChar2 = line.indexOf('{');
         if ((startChar1 >= 0) || (startChar2 >= 0)) {
            if (startChar1 >= 0) {
               endChar = ']';
            } else if (startChar2 >= 0) {
               endChar = '}';
            } else {
               endChar = ((endChar1 < endChar2) ? ']' : '}');
            }
         }
         if (endChar) {
            jsonStart = true;
            jsonBuf = new BufferBuilder();
            console.info("start:", lineNumber);
         }
      }

      if (jsonStart) {
         jsonBuf.appendString(line);
         if ((line.indexOf(endChar) >= 0)) {
            jsonStart = false;
            endChar = null;
            console.info("end:", lineNumber);
            var jsonObj = jsonBuf.get().toString();
            try {
               var json = JSON.parse(jsonObj);
               console.info("====Valid Json====");
               console.info(json);
               validJsonCount++;
               console.info("==================");
            } catch (e) {
               console.error("Invalid JSON: ", e, lineNumber);
               invalidJsonCount++;
            }
         }
      }
   });

   rl.on('close', function() {
      console.info("Done!, Valid = ", validJsonCount, "invalid = ", invalidJsonCount);
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
