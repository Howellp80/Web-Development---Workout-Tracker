var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'mysql.eecs.oregonstate.edu',
  user            : 'cs290_howellp',
  password        : 'xxxxxxxxxxx',
  database        : 'cs290_howellp'
});

module.exports.pool = pool;
