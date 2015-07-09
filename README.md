relevant-text
=============


NodeJS Package to extract relevant text from html pages.

## How to use  

Into *example* folder you can see the *example01.js* script with a example.  

Basically:  

```
npm install relevant-text
```

```javascript
var rt = require('relevant-text');

var text = rt.fromURI('https://www.npmjs.com',
	function (error,data) {
		if (error) {
			throw error;
		}
		console.log(data);
	});
```
  
The result is the relevant text extracted from page.  