
var express = require('express');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var mysql = require('./dbcon.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 25874);



app.get('/', function(req, res, next) {
   res.render('home');
});



app.post('/addExer', function(req, res) {
   var newRow = {};
      newRow.name = req.body.name;
      newRow.reps = req.body.reps;
      newRow.weight = req.body.weight;
      newRow.date = req.body.date;
      newRow.lbs = req.body.lbs;

   var context = {};

   mysql.pool.query('INSERT INTO workouts SET ?', newRow, function(err, results) {
      if (err) {
         //console.log("Error at .get '/'");
         next(err);
         return;
      }
      mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields) {
         if (err) {
            next(err);
            return;
         }
         context.results = JSON.stringify(rows);
         res.send(context.results);
      });
   });
});



app.get('/fetch', function(req, res) {
   var context = {};
   mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields) {
      if (err) {
         next(err);
         return;
      }
      context.results = JSON.stringify(rows);
      res.send(context.results);
   });
});



app.get('/edit', function(req, res, next) {
   var context = {};
   mysql.pool.query('SELECT * FROM workouts WHERE id=?', [req.query.id], function(err, rows, fields) {
      if (err) {
         next(err);
         return;
      }
      context.result = rows[0];

      //Check the box if lbs boolean is true.
      context.usingLbs = "";
      context.usingKg = "";
      if (context.result.lbs == 1) 
         context.usingLbs = "checked";
      else
         context.usingKg = "checked";
      var cutDate = context.result.date; //.slice(0,10);
      context.result.date = JSON.stringify(cutDate).slice(1,11);
      //console.log(JSON.stringify(context));
      res.render('edit', context);
   });
});



app.post('/edit', function(req, res, next) {
   var context = {};
   //console.log("In POST to /edit");
   //console.log("req.body.id:");
   //console.log(req.body.id);
   mysql.pool.query('SELECT * FROM workouts WHERE id=?', [req.body.id], function(err, result) {
      if (err) {
         next(err);
         return;
      }
      if (result.length == 1) {
         var curVals = result[0];
         var useLbs;
         if(req.body.lbs){
            useLbs = 1;
         } else {
            useLbs = 0;
         }
         //console.log(JSON.stringify(req.body));
         mysql.pool.query('UPDATE workouts SET name=?, reps=?, weight=?, lbs=?, date=?  WHERE id=?', [req.body.name || curVals.name, req.body.reps || curVals.reps, req.body.weight || curVals.weight, useLbs, req.body.date || curVals.date, req.body.id],
            function(err, result) {
               if (err) {
                  next(err);
                  return;
               }
               context.results = JSON.stringify(result);
               res.send(context.results);
            });
      }
   });
});



app.post('/delete', function(req, res) {
   var context = {};
   console.log(req.body.id);
   mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.body.id], function(err, result) {
      if (err) {
         next(err);
         return;
      }
      mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields) {
         if (err) {
            next(err);
            return;
         }
         context.results = JSON.stringify(rows);
         res.send(context.results);
      });
   });
});



app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home', context);
    })
  });
});



app.use(function(req,res){
  res.status(404).send("Page Not Found, Silly!");
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500).send("There was an Error, Silly!");
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});




