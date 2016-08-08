//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var vm = require('vm');
var path = require('path');
var util = require('util');
            // HTTP – прикладной протокол передачи данный, используемый для получения информации с веб-сайтов.

            // HTTPS - расширение протокола HTTP, поддерживающее шифрование по протоколам SSL и TLS. 
            

var express = require('express'); // web fraimwork построенном на базе connect Автором express является TJ
                                  // создает web-сервер, «слушающий» порт  и обрабатывающий запрос к /,
var bodyParser = require('body-parser'); //Если вы хотите обрабатывать POST запросы,
                                        //то вашему приложению необходимо использовать специальный middleware

// Middleware-функцией в основном зовётся функция, которая принимает в качестве параметров request и responce-объекты, 
// а также callback-функцию, которая будет вызвана следующей.
// Каждая middleware-функция решает: либо ответить, используя responce-объект, либо передать поток следующей callback-функции

var Entities = require('html-entities').Html5Entities //html_entity_decode — Преобразует все HTML-сущности в соответствующие символы
// данная функция обрезает или преобразует некоторые служебные символы, 
// чтобы они уже не воспринимались браузером или сервером как исполняемый скрипт

var entities = new Entities();


//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var app = express();
var server = http.createServer(app);

app.use(bodyParser.json());

app.post('/', function(req, res) {
    var sandbox = {
      result: null,
      console: {
        log: function() {
          var args = arguments;
          Object.keys(args).forEach(function(key){
            console.log(args[key]);
          });
        }
      }
    };
    
    var context = new vm.createContext(sandbox);
    
    var script = new vm.Script(
      'try {result = (function(){' + entities.decode(req.body.code) + '})() } \
      catch (e) { \
        result = e \
      } \
      ');
    
    console.log('Starting script execution');
    
    script.runInContext(context);
    
    console.log('Script execution finished');
    // console.log(util.inspect(context.result));
    res.send(util.inspect(context.result));
});

server.listen(8282, "localhost", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});

