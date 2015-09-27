var request = require('request');
var fs = require('fs');

var extractJSON = function() {
   fs.readFile("temp.html", function(err, data) {
      if (err) {
         console.error(err);
      } else {
         var lines = data.toString().split('\n');
         var jsonObjs = 0;
         console.info("No. of lines:", lines.length);
         for (var i = 0; i < lines.length; i++) {
            if ((-1 != lines[i].indexOf('{')) || (-1 != lines[i].indexOf('['))) {
               jsonObjs++;
            }
         }
         console.info("No. of potential jsonObjs:", jsonObjs);
      }
   });
};

var processUrl = function(url) {
   request.get(url).on('error', function(err) {
      console.error(err);
   }).pipe(fs.createWriteStream("temp.html").on('finish', function() {
      console.info('done');
      extractJSON();
   }));
};

var url = "https://github.com/docker/docker/blob/master/docs/reference/api/docker_remote_api_v1.0.md";

processUrl(url);
//extractJSON();