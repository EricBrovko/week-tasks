var path = require('path');

var requestify = require('requestify');
var async = require("async");
var sqlite3 = require('sqlite3').verbose();
var Entities = require('html-entities').Html5Entities

var entities = new Entities();
var db = new sqlite3.Database(path.resolve(__dirname, '../../dev.db'));

module.exports = function(req,res) {
    var task = {
        id: null,
        code: entities.encode(req.body.code),
        result: null,
        created_at: Date.now(),
        finished_at: null,
        execution_time: null,
        status: 'received'
    }
    async.waterfall([ 
        function(callback) {
            db.run('INSERT INTO tasks (code, status, created_at) VALUES ("' + task.code + '" , "' + task.status + '" , "' + task.created_at + '")', function(err) {
                if (err) {
                    throw err;
                }
                task.id = this.lastID
                console.log('Task created');
                callback(null);
            })
        },
        function (callback) {
          task.status = 'running';
          db.run('UPDATE tasks SET status = "'+ task.status + '" WHERE id = "' + task.id + '"');
          console.log('Task running');
          requestify.post('http://localhost:8282', {  
              code: task.code
            }).then(function(response) {
                task.result = response.getBody(); // ответ с бека
                task.status = 'finished';
                task.finished_at = Date.now();
                task.execution_time = (task.finished_at - task.created_at) / 1000;
                console.log('Finished');
                callback(null);
          }).catch(callback);
        },
        function (callback) {
            db.run('UPDATE tasks SET \
                    status = "'+ task.status + '", \
                    result = "'+ task.result + '", \
                    finished_at = "'+ task.finished_at + '", \
                    execution_time = "'+ task.execution_time + '" \
                    WHERE id = "' + task.id + '"', function(err) {
                        console.log('Task updated');
                        callback(err);
                    });
        },
        function (callback) {
            db.get('SELECT * FROM tasks WHERE id = "' + task.id + '"', function(err, row) {
                console.log(row);
                callback(null);
            })
        }
    ], 
    function(err, result) {
        if (err) {
            task.status = 'error';
            task.result = err;
            db.run('UPDATE tasks SET status = "'+ task.status + '", result = "'+ task.result + '" WHERE id = "' + task.id + '"');
            console.log('received error: ', err);
        }
    })
    res.render('result', {
        response: 'Ваш запрос обрабатывается'
    });
}

