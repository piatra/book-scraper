var booksDB = require('./booksDB');
var SF_BOOKS = 'http://www.amazon.com/Best-Sellers-Kindle-Store-Science-Fiction/zgbs/digital-text/158591011';

var xray = require('x-ray');
var x = xray();
var noBooks;

function scrapePage() {
  x(SF_BOOKS, {
    items: x('.zg_itemWrapper', [{
        href: x('.zg_title a', '@href'),
        author: x('.zg_byline', '')
    }])
  }).paginate('.zg_page.zg_selected+.zg_page a@href')
    .limit(1)(function(err, data) {
      if (err) {
        console.log(err);
        return;
      }

      noBooks = data[0].items.length;
      data[0].items.forEach(parseBookPage);
    });
}

function parseBookPage(link) {
  var href   = link.href.trim();
  var author = link.author.trim();
  x(href, 'body', {
      title: '#ebooksProductTitle',
      asin: x('#productDetailsTable .content ul', 'li', [
        {
          content: ''
        }
      ]),
      overall_rank: x('#SalesRank', ''),
      ranks: x('#SalesRank', 'li:nth-child(n+2)', [
        {
          rank: '.zg_hrsr_rank',
          main_category: '.zg_hrsr_ladder > a',
          sub_category: '.zg_hrsr_ladder b'
        }
      ])
  })(function(err, data) {
    if (err) {
      console.log(err);
    } else {
      data.overall_rank = data.overall_rank.match(/\d+/)[0];
      data.asin         = fetchASIN(data.asin);
      data.author       = author.substring(3);
      console.log(data);
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
    }
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
