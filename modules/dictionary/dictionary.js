var http = require("http");

var Dictionary=
{
	create:function(app){
		app.get('/service/dictionary/:word', function(req, res){
			var word = req.param("word");
			console.log(word);
			var options = {
				host: 'www.dictionaryapi.com',
				port: 80,
				path: '/api/v1/references/collegiate/xml/'+word+'?key=cb7c1a74-5802-49e4-8ae2-bc7480756613'
			};

			var httpRequest = http.get(options, function(response) {
				console.log("Got response: " + response);
			}).on('error', function(e) {
				console.log("Got error: " + e.message);
			});
	});
	}
};

module.exports =Dictionary;