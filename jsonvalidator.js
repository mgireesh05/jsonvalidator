var request = require('request');
var fs = require('fs');
var tempFile = "temp.html";
var writeFile = "write.html";
var PythonShell = require('python-shell');
var tempFile = 'temp.html';
var chalk = require('chalk');
var config = require('./config');

var MAX_FILE_SZ = (100 * 1024 * 1024);

var processUrl = function(url) {
    request.get(url).on('error', function(err) {
        console.error(err);
    }).pipe(fs.createWriteStream(tempFile).on('finish', function() {
        console.info('done');
        fs.stat(tempFile, function(err, stats) {
            if (stats.size > MAX_FILE_SZ) {
                console.error("File too big, aborting!");
                fs.unlinkSync(tempFile);
                return;
            }
            var options = {
                mode: 'text',
                scriptPath: './',
                args: [tempFile]
            };

            var shell = new PythonShell('proc.py', options);
            var validJsonCount = 0;
            var invalidJsonCount = 0;
            shell.on('message', function(message) {
                try {
                    JSON.parse(message);
                    validJsonCount++;
                } catch (e) {
                    console.error("==============================");
                    console.error(chalk.red("#Invalid JSON#\n", message));
                    console.error("==============================");
                    invalidJsonCount++;
                }
            });

            shell.on('close', function() {
                console.info("Total:: ", chalk.green("Valid: ", validJsonCount),
                    chalk.red(" Invalid: ", invalidJsonCount));
                fs.unlinkSync(tempFile);
            });
        });
    }));
};


processUrl(config.get("inputUrl"));
