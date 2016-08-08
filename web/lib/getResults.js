var path = require('path');

var sqlite3 = require('sqlite3').verbose();
var Entities = require('html-entities').Html5Entities

var entities = new Entities();
var db = new sqlite3.Database(path.resolve(__dirname, '../../dev.db'));

module.exports = function(req, res) {
    db.all('SELECT * FROM tasks', function(err, rows) {
        res.render('results', {
            tasks: rows
        })
    })
}