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
      connection.release();
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
      connection.release();
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
               connection.release();
               cb(err);
             } else {
               connection.release();
               cb(err, result);
             }
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
            rank: rank.rank.substring(1)
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
