var mysql = require('mysql');
var pool  = mysql.createPool({
  connectionLimit : 200,
  host    : 'localhost',
  user    : 'root',
  password: '',
  database: 'books',
  debug   : false,
  waitForConnections: false,
  queueLimit: 60
});

require('events').EventEmitter.defaultMaxListeners = Infinity;

booksTableName = 'books2';
rankTableName  = 'rank3';

function addBook(book_info, cb) {
  pool.getConnection(function(err, connection) {
    if (err) {
      cb(err);
      return;
    }

    connection.on('error', function(err) {
      connection.release();
      cb(err);
    });

    connection
    .query('INSERT INTO ?? SET ?',
           [booksTableName, book_info],
           function(err, result) {
             if (err) {
               console.log("Error inserting", book_info);
               connection.release();
               cb(err);
               return;
             }
             connection.release();
             cb(err, result.insertId);
           });
  });
}

function addRating(book_rating, cb) {
  pool.getConnection(function(err, connection) {
    if (err) {
      cb(err);
      return;
    }
    connection.on('error', function(err) {
      connection.release();
      cb(err);
    });

    connection
    .query('INSERT INTO ?? SET ?',
           [rankTableName, book_rating],
           function(err, result) {
             if (err) {
               console.log("Error inserting", book_rating);
               connection.release();
               cb(err);
             } else {
               connection.release();
               cb(err, result);
             }
           });
  });
}

function queryDBGenerator(cb, query, payload) {
  pool.getConnection(function(err, connection) {
    if (err) {
      connection.release();
      cb(err);
      return;
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

module.exports = {
  getAllBooks: function(cb) {
    pool.getConnection(function(err, connection) {
      if (err) {
        connection.release();
        cb(err);
        return;
      }
      connection.query('SELECT * FROM ??', booksTableName, function(err, rows) {
        connection.release();
        cb(err, rows);
      });

      connection.on('error', function(err) {
        connection.release();
        cb(err);
      });
    });
  },

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
        cb(err);
        return;
      }

      connection.query('DELETE FROM ??', booksTableName, function(err) {
        if (err) {
          cb(err);
          return;
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
          cb(err);
          return;
        }
        data.ranks.forEach(function(rank) {
          addRating({
            category: rank.sub_category,
            main_category: rank.main_category === 'Books',
            book_id: data.asin,
            rank: rank.rank.substring(1) // removes # sign
          }, function(err, result) {
            if (err) {
              cb(err);
              return;
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
      cb(err);
      return;
    });
  }
};
