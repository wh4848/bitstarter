#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commender.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

+ cheerio
- https://github.com/MattewMueller/cheerio
- http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
- http://maxogden.com/scraping-with-node.html

+commander.js
- https://github.com/visionmedia/commander.js
- https://tjholowaychuk.com/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

+JSON
-http://en.wikipedia.org/wiki/JSON
-https://developer.mozilla.org/en-US/docs/JSON
-https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
	}
    return instr;
};

var assertUrlExists = function(inur1) {
    var instr = rest.get(inur1).on('complete', function(result) {
	if(result instanceof Error) {
	    console.log("Error: " + result.message);
	    this.retry(5000);
	    } else {
		//console.log(result);
		return result;
		}
	});
    return instr;
    };

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var chechHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
	}
    return out;
};

var clone = function(fn) {
    //workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKFILE_DEFAULT)
    .option('-u, --url <check_url>', 'Path to url address', clone(assertUrlExists))
    .parse(process.argv);
    var checkJson = checkHtmlFile(program.file, program.check);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
