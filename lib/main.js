(function() {
	var argv = require('optimist')
	    .usage('Usage: $0 --url [string]')
    	.demand('url')
    	.describe('url','Extract relevant content from URL')
    	.argv;

	var rt = require('../lib/relevantText');
	rt.fromURI(argv.url,console.log);
}).call(this)