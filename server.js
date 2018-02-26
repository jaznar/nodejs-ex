//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');

var bodyParser = require('body-parser');
app.use(bodyParser.json())


   
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);

app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var query = { APP_VERSION_NAME: "Punto 23" };	

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.post('/adderror', function(req, res) {
if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('erroresaccountdb');
    col.insert(req.body, function (err, result) {
      if (err){
         res.send('Error');
      } else {
        res.send('Success');
      }

    });
  } else {
    res.send('{ sin conexion-1 }');
  }

});

app.get('/drop', function(req, res) {
if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('erroresaccountdb');
    col.drop();
	res.send('{ collection eliminada }');
  } else {
    res.send('{ sin conexion-1 }');
  }
});

app.get('/geterrores', function (req, res) {
	
	// Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
	
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
//	 var query = { APP_VERSION_NAME: "Punto 24" }; 	  
     db.collection("erroresaccountdb").find(query).sort({USER_CRASH_DATE:-1}).toArray(function(err, data) {
         res.send(data);
     });	

  } else {
    res.send('{ sin conexion-1 }');
  }
});

app.get('/geterrorestrace', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
//	 var query = { APP_VERSION_NAME: "Punto 24" }; 
     db.collection("erroresaccountdb").find(query,{STACK_TRACE:1}).sort({USER_CRASH_DATE:-1}).toArray(function(err, data) {
         res.send(data);
     });	

  } else {
    res.send('{ sin conexion-1 }');
  }
});

app.get('/geterrorescount', function (req, res) {
  
	// Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
  // try to initialize the db on every request if it's not already
  // initialized.
	
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
	  
	  var queryp = { APP_VERSION_NAME: req.query['app_version_name_selected'] }; 
     db.collection("erroresaccountdb").find(queryp).count(function(err, count) {
         res.send('Nº Errores: '+ count);
     });	

  } else {
    res.send('{ sin conexion-1 }');
  }
});

app.get('/getgroupbymarca', function (req, res){
	// Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

  if (!db){
	  intDb(function(err){});
  }
  if (db){
	db.collection("erroresaccountdb").aggregate({$group : {_id: { $toUpper: "$BUILD.BRAND" }, total: {$sum: 1}}}, {$sort: {_id: 1}}, 	
      function(err,data) {
         if (err) console.log(err);
         res.send( data );
      }
  );	  
  } else {
	res.send('{ sin conexion-1 }');  
  }
	
});

app.get('/getgroupbyversionandroid', function (req, res){
	// Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

  if (!db){
	  intDb(function(err){});
  }
  if (db){
	db.collection("erroresaccountdb").aggregate({$group : {_id: { $toUpper: "$ANDROID_VERSION" }, total: {$sum: 1}}}, {$sort: {_id: -1}}, 	
      function(err,data) {
         if (err) console.log(err);
         res.send( data );
      }
  );	  
  } else {
	res.send('{ sin conexion-1 }');  
  }
	
});

app.get('/getgroupbyerror', function (req, res){
	// Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

  if (!db){
	  intDb(function(err){});
  }
  if (db){
//	  var query = { APP_VERSION_NAME: "Punto 24" }; 
	db.collection("erroresaccountdb").aggregate({$match: query},{$group : {_id: "$STACK_TRACE", total: {$sum: 1}}}, {$sort: {total: -1}}, 	
      function(err,data) {
         if (err) console.log(err);
         res.send( data );
      }
  );	  
  } else {
	res.send('{ sin conexion-1 }');  
  }
	
});


app.get('/versionesApp', function (req, res){
	// Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

  if (!db){
	  intDb(function(err){});
  }
  if (db){
	db.collection("erroresaccountdb").aggregate({$group : {_id: "$APP_VERSION_NAME"}}, {$sort: {_id: -1}}, 	
      function(err,data) {
         if (err) console.log(err);
         res.send( data );
      }
  );	  
  } else {
	res.send('{ sin conexion-1 }');  
  }
	
});

//ojo pendiente
app.put('/putupdateerror', function (req, res){
  if (!db){
	  intDb(function(err){});
  }
  if (db){
	  req.body.selected
	db.collection("erroresaccountdb").update({"_id" :ObjectId("4e93037bbf6f1dd3a0a9541a") },{$set : {"solucionado":true}});
  } else {
	res.send('{ sin conexion-1 }');  
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
