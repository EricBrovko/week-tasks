var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function (db, callback) {
  db.createTable('tasks', {
    id: { type: 'int', primaryKey: true },
    code: 'text',
    result: 'text',
    status: 'string',
    created_at: 'time',
    finished_at: 'time',
    execution_time: 'time'
  }, callback);
};

exports.down = function (db, callback) {
  db.dropTable('tasks', callback);
};
