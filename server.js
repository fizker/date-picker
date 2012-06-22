var express = require('express')
  , http = express.createServer()
  , hogan = require('hogan.js')
  , fs = require('fs')

  , htmlTemplate = fs.readFileSync('./example/index.mustache', 'utf8')
  , dateTemplate = fs.readFileSync('./example/dp.mustache', 'utf8')
  , html = hogan.compile(htmlTemplate).render({ template: dateTemplate })

  , clientJS = fs.readFileSync('./src/dp.js', 'utf8')
  , hoganJS = fs.readFileSync('./node_modules/hogan.js/web/1.0.0/hogan.min.js', 'utf8')

http.get('/src/dp.js', function(req, res) {
	res.header('content-type', 'application/javascript');
	res.send(clientJS);
});
http.get('/node_modules/hogan.js/web/1.0.0/hogan.min.js', function(req, res) {
	res.header('content-type', 'application/javascript');
	res.send(hoganJS);
});
http.get('/examples', function(req, res) {
	res.send(html);
});

http.listen(8080);

console.log('Server running at http://127.0.0.1:8080/');