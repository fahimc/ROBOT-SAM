

    var natural = require('natural');
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/App'));
app.get('/service/compare/:wordOne/:wordTwo', function(req, res){
    metaphone = natural.Metaphone, soundEx = natural.SoundEx;
    var wordA = req.param("wordOne");
    var wordB = req.param("wordTwo");
    if(!wordA ||!wordB)res.send('0');
    soundEx.attach();
    // console.log(metaphone.compare(wordA, wordB));

    // console.log(wordA.soundsLike(wordB));
    var result =natural.JaroWinklerDistance(wordA,wordB);
    res.send(String(result));
});

app.listen(3000);