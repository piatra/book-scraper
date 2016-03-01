var express = require('express');
var app = express();
var booksDB = require('./booksDB.js');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.get('/books', function(req, res) {
  booksDB.getAllBooks(function(err, resp) {
    if (err) {
      res.status(500).json({error: error});
    } else {
      res.json({books: resp});
    }
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
