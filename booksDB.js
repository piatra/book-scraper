var mysql = require('mysql');
var pool  = mysql.createPool(require('./dbConfig'));

// Prevents warning from setting too many event listeners on pool connections.
require('events').EventEmitter.defaultMaxListeners = Infinity;

booksTableName = 'books2';
rankTableName  = 'rank3';

/*
 * Genering query function for simple queries.
 * Arguments in payload are automatically escaped by mysql module.
 *
 * @param {Function} cb   - Callback function.
 * @param {String} query  - SQL query to execute.
 * @param {Array} payload - Arguments to SQL query.
 *
 */
function queryDBGenerator(cb, query, payload) {
  pool.getConnection(function(err, connection) {
    if (err) {
      connection.release();
      return cb(err);
    }
    connection.query(query, payload, function(err, rows) {
      connection.release();
      cb(err, rows);
    });

    connection.on('error', function(err) {
      connection.release();
      cb(err);
    });
  });
}

function addBook(book_info, cb) {
  queryDBGenerator(cb,
                   'INSERT INTO ?? SET ?',
                   [booksTableName, book_info]);
}

function addRating(book_rating, cb) {
  queryDBGenerator(cb,
                   'INSERT INTO ?? SET ?',
                   [rankTableName, book_rating]);
}

module.exports = {
  getAllCategories: function(cb) {
    queryDBGenerator(cb,
      'SELECT category, main_category FROM ?? GROUP BY category, main_category',
      rankTableName);
  },

  getTopInCategory: function(cb, category, main_category, limit) {
    queryDBGenerator(cb,
      'SELECT * FROM ?? b INNER JOIN (SELECT book_id, rank FROM ?? WHERE category = ? AND main_category = ? LIMIT ?) q on b.id = q.book_id',
      [booksTableName, rankTableName, category, main_category, limit]);
  },

  emptyTables: function(cb) {
    pool.getConnection(function(err, connection) {
      if (err) {
        connection.release();
        return cb(err);
      }

      connection.query('DELETE FROM ??', booksTableName, function(err) {
        if (err) {
          return cb(err);
        }
        connection.query('DELETE FROM ??', rankTableName, function(err) {
          connection.release();
          cb(err);
        });
      });
    });
  },

  insertBook: function(data, cb) {
    var pending = data.ranks.length;
    addBook(
      {
        id: data.asin,
        title: data.title,
        author: data.author
      }, function(err, id) {
        if (err) {
          return cb(err);
        }
        data.ranks.forEach(function(rank) {
          addRating({
            category: rank.sub_category,
            main_category: rank.main_category === 'Books',
            book_id: data.asin,
            rank: rank.rank.substring(1) // removes # sign
          }, function(err, result) {
            if (err) {
              return cb(err);
            }
            if (--pending === 0) {
              cb(err);
            }
          });
        });
      });
  },

  close: function(cb) {
    pool.end(function (err) {
      return cb(err);
    });
  }
};
