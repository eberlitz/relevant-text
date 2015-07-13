var rt = require('../lib/relevantText');

var text = rt.fromURI('https://www.npmjs.com',
	function (error,data) {
		if (error) {
			throw error;
		}
		console.log(data);
	});