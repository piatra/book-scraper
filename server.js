var express = require('express');
var app = express();
var booksDB = require('./booksDB.js');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.redirect('/index.html');
});

app.get('/books', function(req, res) {
  booksDB.getAllBooks(function(err, resp) {
    if (err) {
      res.status(500).json({error: err});
    } else {
      res.json({books: resp});
    }
  });
});

app.get('/categories', function(req, res) {
  booksDB.getAllCategories(function(err, resp) {
    if (err) {
      res.status(500).json({error: err});
    } else {
      res.json({categories: resp});
    }
  });
});

app.get('/:category/:main_category', function(req, res) {
  var MAX_BOOKS = 5;

  booksDB.getTopInCategory(function(err, resp) {
    if (err) {
      res.status(500).json({error: err});
    } else {
      res.json({books: resp});
    }
  }, req.params.category, req.params.main_category, MAX_BOOKS);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
