var booksDb = require('./booksDB');

var SF_BOOKS = 'http://www.amazon.com/Best-Sellers-Kindle-Store-Science-Fiction/zgbs/digital-text/158591011';

var Xray = require('x-ray');
var x = Xray();

x(SF_BOOKS, '.zg_title a', [{
    title: '@href'
}])
  .paginate('.zg_page.zg_selected+.zg_page a@href')
  .limit(1)
(function(err, data) {
  if (!err) {
    data.forEach(function(link) {
      var href = link.title.replace(/\r?\n|\r/g, '');
      x(href, 'body', [{
        title: '#ebooksProductTitle',
        author: '#byline .contributorNameID',
        ranks: x('#SalesRank .zg_hrsr', 'li', [{
          rank: '.zg_hrsr_rank',
          category: '.zg_hrsr_ladder b'
        }])
      }])(function(err, data) {
        console.log(err);
        console.log(JSON.stringify(data, null, ' '));
      });
    });
  }
});
