var booksDB = require('./booksDB');

var SF_BOOKS = 'http://www.amazon.com/Best-Sellers-Kindle-Store-Science-Fiction/zgbs/digital-text/158591011';

//var express = require('express');
//var app = express();

//app.get('/', function (req, res) {
  //booksDB.getAllBooks(function(err, data) {
    //if (err) {
      //res.end("An error has occured");
    //} else {
      //console.log(data);
      //res.json(data);
      //res.end();
    //}
  //});
//});

//app.listen(3000, function () {
  //console.log('Example app listening on port 3000!');
//});

var xray = require('x-ray');
var x = xray();
var noBooks;

function scrapePage() {
  x(SF_BOOKS, '.zg_title a', [{ title: '@href' }])
    .paginate('.zg_page.zg_selected+.zg_page a@href')
    .limit(1)(function(err, data) {
      if (err) {
        console.log(err);
        return;
      }

      noBooks = data.length;
      data.forEach(parseBookPage);
    });
}

function parseBookPage(link) {
  var href = link.title.replace(/\r?\n|\r/g, '');
  x(href, 'body', {
      title: '#ebooksProductTitle',
      asin: x('#productDetailsTable .content ul', 'li', [
        {
          content: ''
        }
      ]),
      author: '#byline .contributorNameID',
      overall_rank: x('#SalesRank', ''),
      ranks: x('#SalesRank', 'li:nth-child(n+2)', [
        {
          rank: '.zg_hrsr_rank',
          main_category: '.zg_hrsr_ladder > a',
          sub_category: '.zg_hrsr_ladder b'
        }
      ])
    })(function(err, data) {
    var i;

    if (err) {
      console.log(err);
      return;
    }

    data.overall_rank = data.overall_rank.match(/\d+/)[0];
    data.asin         = fetchASIN(data.asin);
    booksDB.insertBook(data, function(err) {
      if (err) {
        console.log(err);
      }
      if (--noBooks === 0) {
        booksDB.close(function(err) {
          console.log(err);
        });
      }
    });
  });
}

/*
 * Receives an array of rows, filters through them and returns the book ASIN.
 *
 * @param [{ content: 'Value' }] rows
 */
function fetchASIN(rows) {
  row = rows.filter(function(r) {
    return r.content.match('ASIN');
  });

  return row[0].content.split(' ')[1];
}

booksDB.emptyTables(function(err) {
  if (!err) {
    scrapePage();
  } else {
    console.log('Error trying to empty the DB.');
  }
});
